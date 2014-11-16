var mongoose = require('mongoose');
var _ = require("underscore");

// schema for a thing
var notifySchema = mongoose.Schema({
  "id": Number,
  "title": String,
  "body": String,
  "icon": String
});

module.exports = mongoose.model('Notify', notifySchema);
