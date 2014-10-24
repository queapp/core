var fs = require("fs");
var _ = require("underscore");
var path = require("path");
var async = require("async");
var db = require("../persistant/provider");

// create instance of thing model
var ThingServer = require("../things");

// convert a thing container into a service container
var ServiceConverter = function(services) {

  // slightly different default datastructure
  services.defaultThing = {
    "name": "Untitled Service",
    "desc": "Untitled Service Description",
    "type": "service",
    "id": null,
    "image": null,
    "tags": [],
    "data": {}
  }

  // different get function ->
  // this is used to retreive information from the
  // backend server
  services.get = function(id, done) {

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
  }

  // similar to above, but used to send information to
  // the backend server
  services.put = function(data, done) {

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
      done && done();
    });

  };

  services.delete = function(id, done) {
    // update
    this.get(null, function(all) {

      // get the modified record
      var listIndex = null;
      record = _.find(all, function(i, indx) {
        listIndex = indx;
        return i.id == id || undefined;
      });

      all.splice(listIndex, 1);
      db.deleteService(id, function(err) {
        done();
      });
      // root.put(all);

      // callback
    });
  }

  // setting and retreiving auth key uses different functions
  services.setAuthKey = db.setServiceAuthKey;
  services.getAuthKey = db.getServiceAuthKey;

  return services;
};

// do the conversion
module.exports = function() {
  return ServiceConverter(new ThingServer());
}
