mongoose = require("mongoose")

# conenct to db
module.exports = (host) ->
  
  # connect to mongo database
  mongoose.connect host
  
  # error?
  mongoose.connection.on "error", console.error.bind(console, "db error:")
  
  # success
  mongoose.connection.once "open", ->
    console.log "Connected To Mongo instance:", host
    return

  return
