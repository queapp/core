var mongoose = require('mongoose');
var _ = require("underscore");

// schema for a thing
var blockSchema = mongoose.Schema({
  "name": String,
  "desc": String,
  "id": Number,
  "tags": Array,
  "code": Array,
  "disable": Boolean
});

module.exports = mongoose.model('Block', blockSchema);
