/**
 * This model describes the attributes within each item of the thing collection.
 * @model models/things
 */

var mongoose = require('mongoose');
var _ = require("underscore");

/**
 * This schema describes all the attributes within a thing.
 * @type {object}
 */
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

// Compile the schema into a model
module.exports = mongoose.model('Thing', thingSchema);
