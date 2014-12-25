var mongoose = require('mongoose');
var _ = require("underscore");

// schema for a session token
var userSchema = mongoose.Schema({
  "username": String,
  "hashpass": String,
  "permissions": Array
});


module.exports = mongoose.model('User', userSchema);
