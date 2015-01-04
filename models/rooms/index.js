var mongoose = require('mongoose');
var _ = require("underscore");

// schema for a room
var roomSchema = mongoose.Schema({
  "name": String,
  "desc": String,
  "things": Array
});


module.exports = mongoose.model('Room', roomSchema);
