/**
 * This model describes the attributes within each item of the notify collection.
 * @model models/notify
 */

var mongoose = require('mongoose');
var _ = require("underscore");

/**
 * This schema describes all the attributes within a notification.
 * @type {object}
 */
var notifySchema = mongoose.Schema({
  "id": Number,
  "title": String,
  "body": String,
  "icon": String
});

// Compile the schema into a model
module.exports = mongoose.model('Notify', notifySchema);
