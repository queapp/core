var host = "http://127.0.0.1:8000";

var app = angular.module("QueGui", {});

app.controller("navController", function($scope) {
  this.pageId = 1;

  this.toPage = function(id) {
    this.pageId = id;
  }
});

app.controller("ThingsController", function($scope, $http, thingService) {
  var root = this;

  // get all data from server
  thingService.getAllThings(function(data) {
    root.things = data;
  });

  // given a data type, get the textbox type it would go into
  this.getTypeFor = function(value) {
    switch (typeof value) {
      case "number":
        return "number";
        break;
      default:
        return "text";
        break;
    }
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

  // push changes to server
  // this.push = function() {
  //   $http({
  //       url: "http://" + host + ":" + port + "/things/" + root.id + "/data",
  //       headers: {
  //         "Content-Type": "application/json"
  //       },
  //       body: JSON.stringify(d)
  //     }, function(error, response, body) {
  //       done && done(body);
  //     }
  //   );
  // }

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
