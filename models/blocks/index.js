var async = require("async");
var db = require("../persistant/provider");
var _ = require("underscore");

var jsp = require("uglify-js").parser;
var pro = require("uglify-js").uglify;

module.exports = function(things, services) {
  var root = this;

  this.defaultBlock = {
    "name": "Code Block",
    "desc": "",
    "id": null,
    "tags": [],
    "code": [],
    "loopcode": false,
    "data": {}
  }

  this.socket = null;

  /**
    Add a new thing to the list of things
  */
  this.add = function(data, done) {
    // console.log(123, data)

    // update
    this.get(null, function(all) {

      // allocate id
      maxId = _.max(all, function(i) {
        return i.id;
      }).id || 0;

      // add new record
      item = Object.deepExtend(root.defaultBlock, data);
      item.id = ++maxId;

      db.addBlock(item, function(err, d) {
        // callback
        done && done(item.id);
      });
    });
  }

  /**
    Delete a thing from the list of things
  */
  this.delete = function(id, done) {
    // update
    this.get(null, function(all) {

      // get the modified record
      var listIndex = null;
      record = _.find(all, function(i, indx) {
        listIndex = indx;
        return i.id == id || undefined;
      });

      all.splice(listIndex, 1);
      db.deleteBlock(id, function(err) {
        done();
      });
      // root.put(all);

      // callback
    });
  }

  /**
    Get a list of all things connected to the container
  */
  this.get = function(id, done) {

    // get from persistant data store
    db.findAllBlocks(function(err, records) {
      // search for id
      if (id !== null) {
        records = _.find(records, function(i) {
          return i.id == id || undefined;
        });
      }

      done(records);
    });
  };

  /**
    Update the whole list of things
  */
  this.put = function(data, done) {

    // write to cache
    root.cache = data;
    // p.write(this.underName, data);

    // write to mongodb
    async.map(data, function(data, callback) {
      db.updateBlockById(data.id, data, function(err, d) {
        if (d == 0) {
          // instead, add it
          db.addBlock(data, function(err, d) {
            callback();
          });
        } else {
          callback();
        }
      });
    }, function(err, results) {

      // tell other clients it's time to fetch new data
      root.socket && root.socket.emit("backend-data-change", data);

      // callback
      done && done();
    });

  };

  /**
    Replace modified records in one specific thing
  */
  this.update = function(id, changes, done) {

    // update
    this.get(null, function(data) {

      // get the modified record
      var listIndex = null;
      record = _.find(data, function(i, indx) {
        listIndex = indx;
        return i.id == id || undefined;
      });

      // update record's data
      if (record) {
        // _.each(record.data, function(value, key) {
        //   console.log(key, )
        //   if (changes[key]) {
        //     record.data[key] = _.extend({}, record.data, changes[key]);
        //   };
        // });
        //
        // console.log("-----------------");

        record = Object.deepExtend(record, changes || {});

        db.updateBlockById(record.id, record, function(err, d) {
          // callback
          done && done(d);
        });

      }
    });
  }

  // converts a list of lines of code into an anonymous function
  this.convertCode = function(block, callback) {
    // the code
    code = block.code;

    // already compiled?
    if (block.compiled_code) callback(block.compiled_code);

    // add in a line (sets the que global variable VERY IMPORTANT)
    code.splice(0, 0, "var que = arguments[0];");

    if (typeof code == "object" && code.length) {
      // passed in an array

      // minify the code
      var ast = jsp.parse( code.join("\n") ); // parse code and get the initial AST
      ast = pro.ast_squeeze(ast); // get an AST with compression optimizations
      mincode = pro.gen_code(ast); // compressed code here
      // console.log(mincode);

      // now, try and compile the code
      var args = [null].concat([mincode]);
      var factoryFunction = Function.bind.apply(Function, args);
      try {
        var comp = new factoryFunction();
      } catch(err) {
        callback(err);
      }

      // and, done!
      block.compiled_code = comp;
      callback(comp);

    } else if (typeof code == "function") {
      // already passed in a function
      callback(code);
    } else {
      // error
      callback(null);
    }
  }

  /**
    given blocks, run the code contained within each
  */
  this.runAllBlocks = function() {
    root.get(null, function(data) {

      async.map(data, function(item, callback) {

        // convert the code from an array to an executable function
        item.code.length && root.convertCode(item, function(code) {
          if (typeof code == "function") {

            // some small helper apis to make stuff easier
            var helpers = {

              // get a thing by its tag
              getThingByTag: function(tag, cb) {
                things.get(null, function(data) {

                  // get matching things
                  fltr = _.filter(data, function(item) {
                    return _.contains(item.tags, tag);
                  });

                  // iterate over them
                  _.each(fltr, function(f, ct) {
                    cb(f, ct);
                  });
                });
              },


              // get and set persistant variables intividual to that block
              get: function(elem) {
                return item.data[elem];
              },

              set: function(elem, value) {
                item.data[elem] = value;
                return true;
              },


              // log to console underneath the block
              log: function(msg) {
                root.socket && root.socket.emit("block-log", {
                  id: item.id,
                  type: "info",
                  msg: msg
                });
              },

              // set value for things
              setThingValue: function(id, key, value, callback) {
                // set up the object
                obj = {}
                obj[key] = {value: value};

                // update
                things.update(id, obj, function(data) {
                  callback && (data && callback(true) || callback(null));
                });
              }


            };

            // try and run the block
            function container() {
              // console.log = function(){};
              code(helpers);
            }
            try {
              container();
            } catch(err) {
              // send the error to the frontend
              root.socket && root.socket.emit("block-log", {
                id: item.id,
                type: "error",
                msg: err.stack
              });
            }


          };
        });

        // next block
        callback();
      }, function(err, results) {
        err && console.log(err);
      });

    });
  }

  setInterval(this.runAllBlocks, 1000);

  /**
    Create a response packet with the correct status and message
  */
  this.createResponsePacket = function(status, data) {
    return _.extend({"status": status || "OK", "msg": null}, data || {});
  }

};
