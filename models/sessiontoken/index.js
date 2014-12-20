var mongoose = require('mongoose');
var _ = require("underscore");

// schema for a session token
var sessionTokenSchema = mongoose.Schema({
  "hostname": String,
  "key": String,
  "permissions": String
});


module.exports = mongoose.model('SessionToken', sessionTokenSchema);
