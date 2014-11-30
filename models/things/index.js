var mongoose = require('mongoose');
var _ = require("underscore");

// schema for a thing
var thingSchema = mongoose.Schema({
  "name": String,
  "desc": String,
  "type": String,
  "id": Number,
  "image": String,
  "tags": Array,
  "ip": {
    "host": String,
    "port": Number
  },
  "data": Object,
  "actions": Array
});

module.exports = mongoose.model('Thing', thingSchema);
