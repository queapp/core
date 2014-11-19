var app = angular.module("QueGui");

app.controller("ServicesController", function($scope, $http, servicesService, $interval, $document) {
  var root = this;

  this.selectedThing = null;

  // service authentication key
  this.authKey = null;

  // get all data from server
  servicesService.getAllThings(function(data) {
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

    servicesService.updateThingData(id, data, callback || function() {});
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
    servicesService.removeThing(id, function() {});
  }

  // generate an authentication key
  // used for adding a new service
  this.generateAuthKey = function() {
    servicesService.genAuthKey(function(data) {
      root.authKey = data.key || null;
    });
  }
  this.generateAuthKey();

  // $interval(function(){
  //   servicesService.getAllThings(function(data) {
  //
  //     if ( angular.toJson(root.things) != angular.toJson(data) ) {
  //
  //       // if a new item was added, hide the modal
  //       if (root.things.length !== data.length) {
  //         $("#addServiceModal").modal('hide');
  //         root.generateAuthKey();
  //       }
  //
  //       // update the data
  //       root.things = data;
  //     }
  //
  //   });
  // }, 1000);

  socket.on('backend-data-change', function(data) {
    servicesService.getAllThings(function(data) {
      if ($(':focus').length == 0) {
        // if a new item was added, hide the modal
        if (root.things && root.things.length !== data.length) {
          $("#addServiceModal").modal('hide');
          root.generateAuthKey();
        }

        // update the data
        root.things = data;
      }
    });
  });

});
