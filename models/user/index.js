/**
 * This model describes the attributes within each item of the user collection.
 * @model models/users
 */

var mongoose = require('mongoose');
var _ = require("underscore");

/**
 * This schema describes all the attributes within a user.
 * @type {object}
 */
var userSchema = mongoose.Schema({
  "username": String,
  "hashpass": String,
  "permissions": Array
});

// Compile the schema into a model
module.exports = mongoose.model('User', userSchema);
