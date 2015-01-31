###*
This model describes the attributes within each item of the notify collection.
@model models/notify
###
mongoose = require("mongoose")
_ = require("underscore")

###*
This schema describes all the attributes within a notification.
@type {object}
###
notifySchema = mongoose.Schema(
  id: Number
  title: String
  body: String
  icon: String
)

# Compile the schema into a model
module.exports = mongoose.model("Notify", notifySchema)
