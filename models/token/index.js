var mongoose = require('mongoose');
var _ = require("underscore");

// schema for a thing
var tokenSchema = mongoose.Schema({
  "name": String,
  "data": String
});


module.exports = mongoose.model('Token', tokenSchema);
