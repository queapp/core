var app = angular.module("QueGui");

// controller for things list
app.controller("ThingsController", function($scope, $http, thingService, $interval, $document, tokenService) {
  var root = this;

  this.selectedThing = null;
  this.editMode = false;

  // thing authentication key
  this.authKey = null;

  // new thing to be added
  this.newThing = null;
  this.newControl = {};

  // custom thing
  this.customThing = {};

  // go to next page of add dialog
  this.addNextPage = function() {
    this.newThing.dialogPage++;

    // change page count
    switch (root.newThing.type) {
      case "spark":
        root.newThing.pageCt = 2;
        break;
      default:
        root.newThing.pageCt = 1;
        break;
    }
  }

  // previous page
  this.addPrevPage = function() {
    this.newThing.dialogPage--;
  }

  this.addFinish = function() {
    // initialize thing
    thing = {
      actions: [],
      data: {},
      name: root.newThing.name,
      desc: root.newThing.desc,
      tags: (root.newThing.tags || "").split(' ')
    };

    // is this a custom thing?
    switch(root.newThing.type) {
      case "manual":
        thing = _.extend(thing, JSON.parse(root.customThing));
        break;

      // preprocessing for spark
      case "spark":
        root.newThing.actions = [];

        // add each pin to the list
        _.each(root.newThing.pins, function(pinv, pin) {
          thing.actions.push({
            name: pinv,
            trigger: {
              method: "GET",
              url: "http://api.spark.io/v1/devices/"+root.newThing.id+"/digitalwrite",
              params: {
                args: pin+",HIGH",
                access_token: tokenService.tokens.sparktoken
              }
            },
            detrigger: {
              method: "GET",
              url: "http://api.spark.io/v1/devices/"+root.newThing.id+"/digitalwrite",
              params: {
                args: pin+",LOW",
                access_token: tokenService.tokens.sparktoken
              }
            }
          });
        });

        break;
    }

    // add the thing to the database serverside
    $http({
      method: "POST",
      url: "/things/add",
      data: JSON.stringify(thing)
    });

  }

  // initialize the newThing object on cancel (or on start)
  // and the customThing JSON string if the user is adding a custom thing
  this.addCancel = function() {
    root.newThing = {
      dialogPage: 0,
      pageCt: 1,
      idClaimed: false,
      type: "",
      pins: {},
      actions: {},
      finished: false
    }
    root.customThing = JSON.stringify({
      actions: [],
      data: []
    }, null, 2);
  }

  // run this now
  this.addCancel();

  // also, bind it to modal close
  $('#addThingModal').on('hidden.bs.modal', function(){
    root.addCancel();
    $scope.$apply();
  });

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

  // add a new control to the list of them
  this.addControl = function(id) {
    thingService.getAllThings(function(things) {
      // get by id
      ts = _.filter(things, function(t) {
        return t.id == id;
      });

      // calculate value
      switch (root.newControl.type) {
        case "bool":
        case "button":
          root.newControl.value = false;
          break;
        case "number":
          root.newControl.value = 0;
          break;
        default:
          root.newControl.value = "";
      };

      // get rid of the type, its served its purpose
      delete root.newControl.type;

      // add each control to the thing
      _.each(ts, function(thing) {
        // thing.data[root.newControl.name] = root.newControl;
        root.updateThingData(id, root.newControl.name, root.newControl, function(){});
      });
    });
  };

  this.deleteControl = function(id, cname, callback) {
    console.log(1)
    thingService.getAllThings(function(things) {

      // get all matching things
      things.filter(function(i) {
        return i.id == id;
      }).forEach(function(thing) {
        console.log(2)
        thing.data[cname] = null;
        thingService.updateThingData(id, thing.data, function() {
          callback && callback();
        });
      });

    });
  }

  this.refresh = function() {
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
  }

  socket.on('backend-data-change', function() {
    root.refresh();
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
