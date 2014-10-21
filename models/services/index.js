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
      db.updateServiceById(data.id, data, function(err, data) {
        callback();
      });
    }, function(err, results) {
      done && done();
    });

  };

  return services;
};

// do the conversion
module.exports = function() {
  return ServiceConverter(new ThingServer());
}
