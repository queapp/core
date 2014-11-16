var async = require("async");
var _ = require("underscore");
var helperConstructor = require("./helpers");

// uglify js
var jsp = require("uglify-js").parser;
var pro = require("uglify-js").uglify;

// the model
var Block = require("../../models/blocks");

module.exports = function(things, services, notify) {
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

      // save block
      var block = new Block(item);
      block.disable = false;
      block.save(function(err, d) {
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

      // remove the block
      Block.remove({id: id}, function(err, docs) {
        done(err);
      });
    });
  }

  /**
    Get a list of all things connected to the container
  */
  this.get = function(id, done) {

    // get from persistant data store
    Block.find(function(err, docs) {
      ret = [];
      _.each(docs, function(doc) {

        // convert to object from model
        ob = doc.toObject();
        delete ob._id;

        // add to array
        ret.push(ob);
      });

      // search for id
      if (id !== null) {
        ret = _.find(ret, function(i) {
          return i.id == id || undefined;
        });
      }

      done(ret);
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
        // apply any changes
        record = Object.deepExtend(record, changes || {});

        // update block
        Block.update({id: record.id}, record, {}, function(err, d) {
          // callback
          done && done(d);
        });

      }
    });
  }

  /**
    converts a list of lines of code into an anonymous function
  */
  this.convertCode = function(block, callback) {
    // the code
    code = block.code.slice(0);

    // already compiled?
    if (block.compiled_code) callback(block.compiled_code);

    // add in a line (sets the que global variable VERY IMPORTANT)
    code.splice(0, 0, "var que = arguments[0];");

    if (typeof code == "object" && code.length) {
      // passed in an array

      // minify the code
      var mincode;
      try {
        var ast = jsp.parse( code.join("\n") ); // parse code and get the initial AST
        ast = pro.ast_squeeze(ast); // get an AST with compression optimizations
        mincode = pro.gen_code(ast); // compressed code here
      } catch(err) {
        // a minification error
        callback(null, err);
      }

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
        item.disable === false && item.code.length && root.convertCode(item, function(code, err) {
          if (typeof code == "function") {

            // create helpers
            helpers = helperConstructor(root.socket, things, services, notify, item);

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


          } else if (code === null && err) {
            // error
            root.socket && root.socket.emit("block-log", {
              id: item.id,
              type: "error",
              msg: "Error: " + err.message + " on line " + (err.line-1) + "; col " + err.col
            });
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
