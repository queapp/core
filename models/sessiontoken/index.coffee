###*
This model describes the attributes within each item of the sessiontoken collection.
@model models/sessiontoken
###
mongoose = require("mongoose")
_ = require("underscore")

###*
This schema describes all the attributes within a sessiontoken. These are
used to manage user sessions - and they expire.
@type {object}
###
sessionTokenSchema = mongoose.Schema(
  hostname: String
  key: String
  permissions: Array
  username: String
  createdAt:
    type: Date
    expires: "1d"
)
module.exports = mongoose.model("SessionToken", sessionTokenSchema)
