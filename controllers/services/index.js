var fs = require("fs");
var _ = require("underscore");
var path = require("path");
var async = require("async");
var db = require("../persistant/provider");
var Authkey = require("../../models/authkey");

// a service container
module.exports = function(thedb) {
  var root = this;

  // currently active auth key
  this.currentAuthKey = null;

  // a default service; used in .add()
  this.defaultService = {
    "name": "Untitled Service",
    "desc": "Untitled Service Description",
    "type": "service",
    "id": null,
    "image": null,
    "tags": [],
    "data": {}
  }


  // the websocket instance
  this.socket = null;

  // setting and retreiving auth keys
  this.setAuthKey = function(akey) {
    // remove all current authkeys (there can only be one!)
    Authkey.remove({type: "service"}, function(err) {

      // add our new one
      var authkey = new Authkey();
      authkey.type = "service";
      authkey.key = akey;
      authkey.save();

    });
  };
  
  this.getAuthKey = function(callback) {
    // get the current thing authkey
    Authkey.findOne({type: "service"}, function(err, doc) {
      // convert to object from model
      ob = doc.toObject();
      delete ob._id;

      // callback
      callback(err, ob.key);
    });
  };

  /**
    Create a new auth key for adding a thing
  */
  this.createNewAuthKey = function(length, chars) {

    // result string
    var result = '';

    // character choices
    chars = chars || 'ABCDEFGHJKLMNPQRTWXY34689';

    // generate the key
    for (var i = length || 8; i > 0; --i)
      result += chars[Math.round(Math.random() * (chars.length - 1))];

    // cache it for later
    this.currentAuthKey = result;
    this.setAuthKey(result);

    return result;
  }

  /**
    Try and add a new thing, but only if the user specifies
    the correct authentication key
  */
  this.addWithAuth = function(userKey, data, done) {

    // fetch the auth key
    this.getAuthKey(function(err, authkey) {
      console.log(authkey)
      // only if auth key exists
      if (typeof authkey !== "string" || typeof userKey !== "string") {
        done(null);
        return;
      }

      // is auth key correct?
      if ( authkey.toLowerCase() == userKey.toLowerCase() ) {

        // reset key and add thing
        root.createNewAuthKey();
        root.add(data, done);
      } else {
        done(null);
      }
    });
  }

  /**
    Add a new thing to the list of things
  */
  this.add = function(data, done) {
    // update
    this.get(null, function(all) {

      // allocate id
      maxId = _.max(all, function(i) {
        return i.id;
      }).id || 0;

      // add new record
      item = _.extend(root.defaultService, data);
      item.id = ++maxId;

      db.addService(item, function(err, d) {
        // tell the frontend it needs to pull in a new thing
        root.socket && root.socket.emit("backend-data-change", data);

        // callback
        done && done(item.id);
      });
    });
  }

  /**
    Delete a thing from the list of things
  */
  this.delete = function(id, done) {
    db.deleteService(id, function(err) {
      // tell the frontend it's time to update
      root.socket && root.socket.emit("backend-data-change", data);

      // callback
      done && done();
    });
  }

  /**
    Get a list of all things connected to the container
  */
  this.get = function(id, done) {

    // get from persistant data store
    db.findAllServices(function(err, records) {
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
      db.updateServiceById(data.id, data, function(err, d) {
        if (d == 0) {
          // instead, add it
          db.addThing(data, function(err, d) {
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
        // add in the new attributes, and save
        record.data = Object.deepExtend(record.data, changes || {});

        db.updateServiceById(id, record, function(err) {
          // tell the frontend it's time to update
          root.socket && root.socket.emit("backend-data-change", data);

          // callback
          done && done();
        });

      }
    });
  }

  this.reorder = function(id, newLocation, callback) {
    this.get(null, function(data) {

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
      root.put(data);
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
