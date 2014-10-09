var fs = require("fs");
var _ = require("underscore");
var path = require("path");

Object.deepExtend = function(destination, source) {
  for (var property in source) {
    if (source[property] && source[property].constructor &&
     source[property].constructor === Object) {
      destination[property] = destination[property] || {};
      arguments.callee(destination[property], source[property]);
    } else {
      destination[property] = source[property];
    }
  }
  return destination;
};

// a thing container
module.exports = function() {
  var root = this;

  // where to store things
  this.dataFile = "things.json";

  // a default thing; used in .addThing()
  this.defaultThing = {
    "name": "Untitled Thing",
    "desc": "Untitled Thing Description",
    "id": null,
    "image": null,
    "tags": [],
    "ip": {
      "host": null,
      "port": null
    },
    "data": {}
  }

  /**
    Add a new thing to the list of things
  */
  this.add = function(data, done) {
    // update
    this.getThings(null, function(all) {

      // allocate id
      maxId = _.max(all, function(i) {
        return i.id;
      }).id;

      // add new record
      item = _.extend(root.defaultThing, data);
      item.id = ++maxId;
      all.push( item );
      root.putThings(all);

      // callback
      done(item.id);
    });
  }

  /**
    Delete a thing from the list of things
  */
  this.delete = function(id, done) {
    // update
    this.getThings(null, function(all) {

      // get the modified record
      var listIndex = null;
      record = _.find(all, function(i, indx) {
        listIndex = indx;
        return i.id == id || undefined;
      });

      all.splice(listIndex, 1);
      root.putThings(all);

      // callback
      done();
    });
  }

  /**
  Get a list of all things connected to the container
  */
  this.get = function(id, done) {
    fs.readFile(path.join(__dirname, this.dataFile), 'utf8', function(err, data) {
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
  this.put = function(data, done) {
    txt = JSON.stringify(data, null, 2);
    fs.writeFile(path.join(__dirname, this.dataFile), txt, function(err) {
      !err && done && done();
    });
  }

  /**
  Replace modified records in one specific thing
  */
  this.update = function(id, changes, done) {

    // update
    this.getThings(null, function(data) {

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

        record.data = Object.deepExtend(record.data, changes || {});
        // record.data = _.extend({}, record.data, changes || {});

        // recompile the record
        var all = data;
        all[listIndex] = record;
        root.putThings(all);

        // callback
        done(all);
      }
    });
  }

  this.reorder = function(id, newLocation, callback) {
    this.getThings(null, function(data) {

      // get the modified record
      var listIndex = null;
      record = _.find(data, function(i, indx) {
        listIndex = indx;
        return i.id == id || undefined;
      });

      // shift it around
      tempData = data[listIndex];
      data.splice(listIndex, 1);
      data.splice(newLocation, 0, tempData);

      // save it
      root.putThings(data);
      callback(data);
    });
  }



  /**
  Create a response packet with the correct status and message
  */
  this.createResponsePacket = function(status, data) {
    return _.extend({"status": status || "OK", "msg": null}, data || {});
  }



}
