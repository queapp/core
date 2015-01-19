var app = angular.module("QueGui");

app.controller("RoomsController", function($scope, $http, roomsService, thingService, $interval, $document) {
  var root = this;

  this.rooms = [];

  this.selectedThing = null;

  // service authentication key
  this.authKey = null;

  // creating new rooms
  this.newRoom = {};

  // process newly aquired data from server
  // takes each thing within each room and
  // fills in the missing data for conveinence
  this.processNewData = function(things, data) {
    _.each(data, function(rm, i) {
      _.each(rm.things, function(th, j) {
        thing = _.filter(things, function(i) { return i.id === th.id; });
        th.thing = thing.length && thing[0] || {};
      });
    });

    return data;
  }

  // get all data from server
  roomsService.getAllThings(function(data) {
    thingService.getAllThings(function(things) {

      // process data
      root.rooms = root.processNewData(things, data);

    });
  });

  // given a data type, get the textbox type it would go into
  this.getTypeFor = function(value) {
    if (value.type) {
      return value.type;
    } else {
      switch (typeof value.value) {
        case "number":
          return "number";
          break;
        case "boolean":
          return "checkbox";
          break;
        default:
          return "text";
          break;
      }
    }
  }

  // update backend on keypress
  this.updateThingData = function(id, key, value, callback) {
    data = {}
    data[key] = value;

    roomsService.update(id, data, callback || function() {});
  }

  // convert from CamelCase or underscore-format to normal, smaced words
  this.convertIntoSpaces = function(string) {
    string = string
      // insert a space between lower & upper
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      // space before last upper in a sequence followed by lower
      .replace(/\b([A-Z]+)([A-Z])([a-z])/, '$1 $2$3')
      // uppercase the first character
      .replace(/^./, function(str){ return str.toUpperCase(); })// insert a space between lower & upper
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      // space before last upper in a sequence followed by lower
      .replace(/\b([A-Z]+)([A-Z])([a-z])/, '$1 $2$3')
      // uppercase the first character
      .replace(/^./, function(str){ return str.toUpperCase(); })
    return string.replace('-', ' ').replace('_', ' ');
  }

  this.removeThing = function(rid, tid, tindex) {
    room = root.rooms.filter(function(i) {
      return i.id === rid;
    });

    if (room.length) {
      // room[0].things.splice(tindex, 1);
      delete room[0].things[tindex];
      // room[0].things[tindex].name = "Deleted";
    }

    roomsService.removeThing(rid, tid, function() {});
  }

  // add a new thing to the room
  this.addToRoom = function(id, name) {
    thingService.getAllThings(function(things) {
      // look for possible thins that match the name requirement
      possibles = _.filter(things, function(i) { return i.name === name; });
      if (possibles.length) {
        roomsService.addThing(id, possibles[0].id, function(data) {
          // add the thing to the room
          _.each(_.filter(root.rooms, function(i) {
            return i.id == id;
          }), function(i) {
            i.things.push(possibles[0]);
          });
        });
      }
    });
  };

  this.getRoomId = function(name) {
    id = _.filter(root.rooms, function(room) {
      return room.name === name;
    });
    return id.length ? id[0].id : null;
  }

  // returns each room the specified thing isn't
  // part of; Used for the selection boxes to add
  // a thing to a specified room on thing page.
  this.onlyNotIn = function(rooms, thing) {
    return _.filter(rooms, function(r) {
      // each room that doesn't contain the specified thing
      return !_.filter(r.things, function(t) {
        return t.id === thing;
      }).length;
    });
  }

  // create new room
  this.add = function() {
    roomsService.add({
      name: this.newRoom.name,
      desc: this.newRoom.desc,
      tags: (this.newRoom.tags || '').split(" "),
      things: []
    }, function() {
      $("#addRoomModal").modal('hide');
      root.newRoom = {};
    });
  };

  // remove a room
  this.remove = function(id) {
    roomsService.remove(id);
  };

  // a user entered the room
  this.enterRoom = function(user, room) {

    // add username to list of users in room
    room.usersInside.push(user.auth.username);
    roomsService.updateUsers(room);

    // for each thing in the room...
    _.each(room.things, function(thing) {
      // ... and each control specifed in the thing ...
      _.each(thing.enter, function(vv, kn) {
        // update the control.
        obj = {};
        obj[kn] = vv;
        thingService.updateThingData(thing.id, obj);
      });
    });

  };

  // a user left the room
  this.leaveRoom = function(user, room) {

    // remove username to list of users in room
    room.usersInside.splice(
      room.usersInside.indexOf(user.auth.username),
      1
    );
    roomsService.updateUsers(room);

    // for each thing in the room...
    _.each(room.things, function(thing) {
      // ... and each control specifed in the thing ...
      _.each(thing.leave, function(vv, kn) {
        // update the control.
        obj = {};
        obj[kn] = vv;
        thingService.updateThingData(thing.id, obj);
      });
    });

  };

  // update things for a room
  this.updateThings = function(room) {
    roomsService.updateThings(room.id, room.things, function() {
      $(".modal").modal('hide'); // hide modal
    });
  }

  // the backend has new data for us
  socket.on('backend-data-change', function(payload) {
    if (payload && payload.type === "room") {

      // update the payload data
      thingService.getAllThings(function(things) {
        root.rooms = root.processNewData(things, payload.data);
      });

      // update scope
      $scope.$apply();
    };
  });

});
