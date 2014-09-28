var fs = require("fs");
var _ = require("underscore");
var path = require("path");

// a thing container
module.exports = function() {
  var root = this;

  /**
  Get a list of all things connected to the container
  */
  this.getThings = function(id, done) {
    fs.readFile(path.join(__dirname, "things.json"), 'utf8', function(err, data) {
      records = JSON.parse(data);

      if (id !== null) {
        records = _.find(records, function(i) {
          return i.id == id || undefined;
        });
      }

      !err && done( records );
    });
  }

  /**
  Update the whole list of things
  */
  this.putThings = function(data, done) {
    txt = JSON.stringify(data, null, 2);
    fs.writeFile(path.join(__dirname, "things.json"), txt, function(err) {
      !err && done && done();
    });
  }

  /**
  Replace modified records in one specific thing
  */
  this.updateThings = function(id, changes, done) {

    // update
    this.getThings(null, function(data) {

      // get the modified record
      var listIndex = null;
      record = _.find(data, function(i, indx) {
        listIndex = indx;
        return i.id == id || undefined;
      });

      // update record's data
      record.data = _.extend(record.data, changes || {});

      // recompile the record
      var all = data;
      all[listIndex] = record;
      root.putThings(all);

      // callback
      done(all);
    });
  }



  /**
  Create a response packet with the correct status and message
  */
  this.createResponsePacket = function(status, msg) {
    return {"status": status || "OK", "msg": msg || null};
  }



}
