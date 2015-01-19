var mongoose = require('mongoose');
var _ = require("underscore");

// schema for a room
var roomSchema = mongoose.Schema({
  "name": String,
  "desc": String,
  "id": Number,
  "tags": Array,
  "things": Array,
  "usersInside": Array
});


module.exports = mongoose.model('Room', roomSchema);
