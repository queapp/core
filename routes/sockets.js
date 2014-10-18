// set up socket.io
var http = require('http');
var socket = require('socket.io');

module.exports = function(app, http, things, services) {

  // initialize sockets
  var io = socket(http);

  // client has connected
  io.on('connection', function(socket) {
    console.log("Connect");

    // (things) frontend -> backend
    socket.on('push-thing-data-update', function(changed) {

      // update the backend
      things.update(changed.id, changed.data);

      // propagate the changes (backend -> frontend)
      io.emit('pull-thing-data-update', changed);
    });

    // (services) frontend -> backend
    socket.on('push-service-data-update', function(changed) {

      // update the backend
      services.update(changed.id, changed.data);

      // propagate the changes (backend -> frontend)
      io.emit('pull-service-data-update', changed);
    });

    // the client diconnected
    socket.on('disconnect', function() {
      console.log("Disconnect")
    });
  });


}
