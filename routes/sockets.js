// set up socket.io
var http = require('http');
var socket = require('socket.io');

module.exports = function(app, http, things, rooms) {

  // initialize sockets
  var io = socket(http);

  // client has connected
  io.on('connection', function(socket) {
    // console.log("Connect");

    // (things) frontend -> backend
    socket.on('push-thing-data-update', function(changed) {

      // update the backend
      things.update(changed.id, changed.data);

      // propagate the changes (backend -> frontend)
      io.emit('pull-thing-data-update', changed);
    });

    // (rooms) frontend -> backend
    socket.on('push-room-data-update', function(changed) {

      // update the backend
      room.update(changed.id, changed.data);

      // propagate the changes (backend -> frontend)
      io.emit('pull-service-data-update', changed);
    });

    // the client diconnected
    // socket.on('disconnect', function() {
      // console.log("Disconnect")
    // });
  });

  return io;
}
