# set up socket.io
http = require("http")
socket = require("socket.io")
module.exports = (app, http, things, rooms) ->
  
  # initialize sockets
  io = socket(http)
  
  # client has connected
  io.on "connection", (socket) ->
    
    # console.log("Connect");
    
    # (things) frontend -> backend
    socket.on "push-thing-data-update", (changed) ->
      
      # update the backend
      things.update changed.id, changed.data
      
      # propagate the changes (backend -> frontend)
      io.emit "pull-thing-data-update", changed
      return

    
    # (rooms) frontend -> backend
    socket.on "push-room-data-update", (changed) ->
      
      # update the backend
      room.update changed.id, changed.data
      
      # propagate the changes (backend -> frontend)
      io.emit "pull-service-data-update", changed
      return

    return

  
  # the client diconnected
  # socket.on('disconnect', function() {
  # console.log("Disconnect")
  # });
  io
