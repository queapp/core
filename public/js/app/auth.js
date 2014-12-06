var app = angular.module("QueGui");

app.controller("AuthController", function($scope, $http, $location, nav, loggedin) {
  var root = this;

  this.user = "";
  this.pass = "";

  this.save = function() {
    $http({
      method: "POST",
      url: "/user/authenticate",
      data: {
        name: this.user,
        pass: this.pass
      }
    }).success(function(data) {
      if (data.status == "OK") {

        // update the saved login record
        loggedin.whoami();

        // redirect back to main page
        $location.path("/dashb");
      } else {
        alert("error");
      }
    });
  }

});
