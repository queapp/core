var app = angular.module("QueGui");

// controller for things list
app.controller("ThingsController", function($scope, $http, thingService, $interval, $document) {
  var root = this;

  this.selectedThing = null;

  // thing authentication key
  this.authKey = null;

  // get all data from server
  thingService.getAllThings(function(data) {
    root.things = data;
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
        case "canvas":
        case "video":
          return "canvas";
          break;
        default:
          return "text";
          break;
      }
    }
  }

  // is this control represented as a button?
  this.isButton = function(v) {
    return v.type == "button";
  }

  // update backend on keypress
  this.updateThingData = function(id, key, value, callback) {
    data = {}
    data[key] = value;

    thingService.updateThingData(id, data, callback || function() {});
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

  // generate an authentication key
  // used for adding a new thing
  this.generateAuthKey = function() {
    thingService.genAuthKey(function(data) {
      root.authKey = data.key || null;
    });
  }
  this.generateAuthKey();

  this.removeThing = function(id, index) {
    root.things.splice(index, 1);
    thingService.removeThing(id, function() {});
  }

  socket.on('backend-data-change', function(data) {
    thingService.getAllThings(function(data) {
      if ( $(':focus').length == 0 || _.contains(["checkbox", "button"], $(':focus').attr("type"))) {
        // if a new item was added, hide the modal
        if (root.things.length !== data.length) {
          $("#addThingModal").modal('hide');
          root.generateAuthKey();
        }

        // update the data
        root.things = data;
      }
    });
  });


  socket.on("canvas-update", function(data) {
    canvas = $(".canvas-"+data.id+"-"+data.key)[0];
    cxt = canvas.getContext('2d');

    // colors
    if (data.fillColor) cxt.fillStyle = data.fillColor
    if (data.strokeColor) cxt.strokeStyle = data.strokeColor

    // what to do?
    switch (data.action) {
      case "clear":
        cxt.clearRect(
          data.x || 0,
          data.y || 0,
          data.w || canvas.width,
          data.h || canvas.height
        );
        break;

      case "line":
        /*
        {
          action: "line",
          nodes: [
            [0, 0],
            [10, 10]
          ],
          fillColor: "red",
          strokeColor: "red",
          finished: "stroke"
        }
        */

        // start drawing line
        cxt.beginPath();
        cxt.moveTo(
          data.nodes[0][0],
          data.nodes[0][1]
        );

        // each node
        _.each(_.rest(data.nodes), function(n) {
          cxt.lineTo(n[0], n[1]);
        });

        // finish
        (data.finished == "fill") && cxt.fill();
        (data.finished == "stroke") && cxt.stroke();
        break;

      case "rect":
        // draw rectangle
        cxt.fillRect(
          data.x || 0,
          data.y || 0,
          data.w || canvas.width,
          data.h || canvas.height
        );
        break;

      case "text":
        // draw text
        cxt.fillText(data.text, data.x || 0, data.y || 0);
        break;

      case "image":
        // add image to canvas
        img = new Image();
        img.src = data.src;
        img.onload = function(){
          cxt.drawImage(img, data.x || 0, data.y || 0);
        }
        break;
    }
  });
});
