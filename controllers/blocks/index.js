/**
 * Block Controller. This module manages all the serverside CRUD operations
 * pertaining to blocks, and the code within them.
 * @module controller/blocks
 */

// requires
var async = require("async");
var _ = require("underscore");
var helperConstructor = require("./helpers");

// uglify js
var jsp = require("uglify-js").parser;
var pro = require("uglify-js").uglify;

// the block model
var Block = require("../../models/blocks");

module.exports = function(things, services, rooms, notify) {
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
  * Add a new block to the block collection.
  * @param {object}   data The data to add to the block collection
  * @param {Function} done Optional callback. Passes the new block id on success.
  */
  this.add = function(data, done) {
    this.get(null, function(all) {

      // allocate a new id by picking a new one
      // 1 highter than the previous higher one
      //
      // TODO: There is a high probability that
      // ids can be lost be deleting lower numbered
      // items before higher-numbered ones.
      maxId = _.max(all, function(i) {
        return i.id;
      }).id || 0;

      // add new block
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
   * Deletes a block from the block collection.
   * @param  {number}   id   The id of the block to delete.
   * @param  {Function} done Optional callback. Returns any error if one exists.
   */
  this.delete = function(id, done) {
    Block.remove({id: id}, function(err, docs) {
      done && done(err);
    });
  }

  /**
   * Get a list of all blocks currently within the container.
   * @param  {number}   id   If a number, filter by the passed id. Otherwise,
   *                         return all ids.
   * @param  {Function} done The callback - returns the found blocks.
   */
  this.get = function(id, done) {

    // get from the collection
    Block.find(function(err, docs) {

      // convert all models to objects
      // for encapulation
      ret = docs.map(function(doc) {
        ob = doc.toObject();
        delete ob._id;
        return ob;
      });

      // if an id was passed, then search for it.
      if (id) {
        ret = _.find(ret, function(i) {
          return i.id == id || undefined;
        });
      }

      done(ret);
    });
  };

  /**
   * Update the identified block with the provided changes
   * @param  {number}   id      The id for the block to update
   * @param  {object}   changes The changes to make to the block. This doesn't
   *                            have to be a full copy of the block, just the
   *                            changes to be made.
   * @param  {Function} done    Optional callback. Returns updated data on \
   *                            success.
   */
  this.update = function(id, changes, done) {
    Block.update({id: id}, changes, {}, function(err, d) {
      done && done(d);
    });
  }

  /**
   * converts a list of lines of code into an anonymous function - this is how
   * blocks' code are 'compiled' into a function.
   * FIXME: This whole system really isn't secure. Block code execution needs to
   * be re-engineered so exploitation isn''t so simple.
   * @param {object}   block    Block to compile code from
   * @param {Function} callback Callback - first argument shows errors, the
   *                            second argument returns the compiled code
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
        callback(null, err);
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
   * given blocks, run the code contained within each - this is run once per
   * 'clock cycle' to keep blocks executing.
   */
  this.runAllBlocks = function() {
    root.get(null, function(data) {

      async.map(data, function(item, callback) {

        // convert the code from an array to an executable function
        item.disable === false && item.code.length && root.convertCode(item, function(code, err) {
          if (typeof code == "function") {

            // create helpers
            helpers = helperConstructor(root.socket, things, services, notify, rooms, item);

            // check for an error
            if (err && root.socket) {
              root.socket.emit("block-log", {
                id: item.id,
                type: "error",
                msg: err.stack
              });
              // and callback
              callback();
            } else {

              // try and run the block
              function container() {
                // console.log = function(){};
                code(helpers);
              }
              try {
                container();
              } catch(err) {
                console.log(err);
                // send the error to the frontend
                root.socket && root.socket.emit("block-log", {
                  id: item.id,
                  type: "error",
                  msg: err.stack
                });
              }

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
   * Create a response packet with the correct status and message
  */
  this.createResponsePacket = function(status, data) {
    return _.extend({"status": status || "OK", "msg": null}, data || {});
  }

};
