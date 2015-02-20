// set up socket.io
var http = require('http');
var socket = require('socket.io');
var userCan = require("../controllers/auth").can;

module.exports = function(app, http, things, rooms) {

  // initialize sockets
  var io = socket(http);

  // client has connected
  io.on('connection', function(socket) {
    // console.log("Connect");

    // (things) frontend -> backend
    socket.on('push-thing-data-update', function(changed) {

      // is the user allowed to edit a thing?
      userCan(changed.auth, "thing.edit.#id", function(err, allowed) {
        if (allowed) {

          // update the backend
          things.update(changed.id, changed.data);

          // propagate the changes (backend -> frontend)
          io.emit('pull-thing-data-update', changed);
        };
      });

    });

    // (rooms) frontend -> backend
    socket.on('push-room-data-update', function(changed) {

      // is the user allowed to edit a room?
      userCan(changed.auth, "room.edit.#id", function(err, allowed) {
        if (allowed) {

          // update the backend
          rooms.update(changed.id, changed.data);

          // propagate the changes (backend -> frontend)
          io.emit('pull-room-data-update', changed);
        };
      });

    });

    // the client diconnected
    // socket.on('disconnect', function() {
      // console.log("Disconnect")
    // });
  });

  return io;
}
