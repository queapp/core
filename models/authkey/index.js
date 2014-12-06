var mongoose = require('mongoose');
var _ = require("underscore");

// schema for a thing
var authKeySchema = mongoose.Schema({
  "type": String,
  "key": String
});


module.exports = mongoose.model('Authkey', authKeySchema);
