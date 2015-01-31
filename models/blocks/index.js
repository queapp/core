/**
 * This model describes the attributes within each item of the block collection.
 * @model models/blocks
 */

var mongoose = require('mongoose');
var _ = require("underscore");

/**
 * This schema describes all the attributes within a block.
 * @type {object}
 */
var blockSchema = mongoose.Schema({
  "name": String,
  "desc": String,
  "id": Number,
  "tags": Array,
  "code": Array,
  "disable": Boolean
});

// Compile the schema into a model
module.exports = mongoose.model('Block', blockSchema);
