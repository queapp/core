var mongoose = require('mongoose');
var _ = require("underscore");

// schema for a thing
var serviceSchema = mongoose.Schema({
  "name": String,
  "desc": String,
  "type": String,
  "id": Number,
  "image": String,
  "tags": Array,
  "ip": {
    "host": String,
    "port": Number
  },
  "data": Object
});


module.exports = mongoose.model('Service', serviceSchema);
