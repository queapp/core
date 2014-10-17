var fs = require("fs");
var _ = require("underscore");
var path = require("path");

// create instance of thing model
var ThingServer = require("../things");

// convert a thing container into a service container
var ServiceConverter = function(things) {

  // slightly different default datastructure
  things.defaultThing = {
    "name": "Untitled Service",
    "desc": "Untitled Service Description",
    "type": "service",
    "id": null,
    "image": null,
    "tags": [],
    "data": {}
  }

  // different datafile location
  things.underName = "services";

  return things;
};

// do the conversion
module.exports = function() {
  return ServiceConverter(new ThingServer());
}
