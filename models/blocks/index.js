var async = require("async");
var db = require("../persistant/provider");

module.exports = function() {
  var root = this;

  this.defaultBlock = {
    "name": "Code Block",
    "desc": "",
    "id": null,
    "tags": [],
    "code": []
  }

  this.add = function(data, code, callback) {
    this.get(null, function(all) {

      // allocate id
      maxId = _.max(all, function(i) {
        return i.id;
      }).id || 0;

      // add new record
      item = _.extend(root.defaultBlock, data);
      item.id = ++maxId;
      code && block.code = code;

      // add to collection
      cd.addBlock(block, callback);
    });
  }

  // converts a list of lines of code into an anonymous function
  this.convertCode = function(code, callback) {

    if (typeof code == "object" && code.length) {
      // passed in an array

      // now, try and compile the code
      var args = [null].concat(code);
      var factoryFunction = Function.bind.apply(Function, args);
      var comp = new factoryFunction();

      // and, done!
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
    Create a response packet with the correct status and message
  */
  this.createResponsePacket = function(status, data) {
    return _.extend({"status": status || "OK", "msg": null}, data || {});
  }

};
