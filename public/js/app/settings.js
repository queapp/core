var app = angular.module("QueGui");

app.controller("SettingsController", function($scope, $http) {
  var root = this;

  // store all key info
  root.keys = {};

  // keys that have been validated
  root.validated = {};

  // get keys from server
  $http({
    method: "GET",
    url: "/tokens"
  }).success(function(data) {
    root.keys = data;
    root.validateAll();
  });

  this.updateKeys = function() {
    this.validateAll();

    // do the http request
    $http({
      method: "put",
      url: "/tokens",
      data: JSON.stringify(root.keys)
    });
  };

  // update all key validations
  this.validateAll = function() {
    root.validated.sparktoken = root.keys.sparktoken.length === 40;
  }

});
