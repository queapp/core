var app = angular.module("QueGui");

app.controller("RoomsController", function($scope, $http, roomsService, thingService, $interval, $document) {
  var root = this;

  this.rooms = [];

  this.selectedThing = null;

  // service authentication key
  this.authKey = null;

  // get all data from server
  roomsService.getAllThings(function(data) {
    thingService.getAllThings(function(things) {

      _.each(data, function(rm, i) {
        _.each(rm.things, function(th, j) {
          thing = _.filter(things, function(i) { return i.id === th.id; });
          th.thing = thing.length && thing[0] || {};
        });
      });

      root.rooms = data;

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

  this.removeThing = function(id, index) {
    root.things.splice(index, 1);
    roomsService.removeThing(id, function() {});
  }

  // add a new thing to the room
  this.addToRoom = function(id, name) {
    thingService.getAllThings(function(things) {
      possibles = _.filter(things, function(i) { return i.name === name; });
      if (possibles.length) {
        console.log(id, possibles[0].id)
        roomsService.addThing(id, possibles[0].id, function(data) {
          root.rooms.push({id: id});
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

  socket.on('backend-data-change', function(data) {
    roomsService.getAllThings(function(data) {
      if ($(':focus').length == 0) {
        // if a new item was added, hide the modal
        if (root.rooms && root.rooms.length < data.length) {
          $("#addRoomModal").modal('hide');
          // root.generateAuthKey();
        }

        // update the data
        root.rooms = data;
      }
    });
  });

});
