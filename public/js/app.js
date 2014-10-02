// var host = "http://que-app-backend.herokuapp.com";
var host = "http://127.0.0.1:8000"

var app = angular.module("QueGui", {});

app.controller("navController", function($scope) {
  this.pageId = 1;

  this.toPage = function(id) {
    this.pageId = id;
  }
});

app.controller("ThingsController", function($scope, $http, thingService, $interval) {
  var root = this;

  // get length of thing data
  this.thingDataLength = function(obj) {
    return Object.keys(obj.data).length == 0;
  };

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

  $interval(function(){
    thingService.getAllThings(function(data) {

      if ( angular.toJson(root.things) != angular.toJson(data) ) {
        root.things = data;
      }

    });
  }, 1000);

});


app.factory("thingService", function($http) {
    return {

      getAllThings: function(callback) {
        $http({
          method: "get",
          url: host + "/things/all",
        }).success(function(data) {
          callback(data.data);
        });
      },

      getThingData: function(id, callback) {
        $http({
          method: "get",
          url: host + "/things/" + id + "/data",
        }).success(function(data) {
          callback(data);
        });
      },

      updateThingData: function(id, data, callback) {
        $http({
          method: "put",
          url: host + "/things/" + id + "/data",
          data: JSON.stringify(data)
        }).success(function(data) {
          callback(data);
        });
      }

    };
 });
