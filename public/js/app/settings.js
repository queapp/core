var app = angular.module("QueGui");

app.controller("KeysController", function($scope, $http) {
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

app.controller("UsersController", function($scope, $http) {
  var root = this;

  // all users
  this.users = [
    {
      "username": "superadmin",
      "hashpass": "[hashpass]",
      "permissions": ["*"]
    },
    {
      "username": "ryan",
      "hashpass": "[hashpass]",
      "permissions": [
        "thing.view.all",
        "block.*",
        "auth.*",
        "user.*",
        "service.*"
      ]
    }
  ];

  // new permissions
  this.newPermission = "";

  // add permission
  this.addPermission = function(username, permission) {
    user = _.filter(root.users, function(u) {
      return u.username == username
    });
    if (user.length) {
      userIndex = this.users.indexOf(user[0]);

      // add permission
      this.users[userIndex].permissions.push(permission);

      // remove from newpermissions
      this.newPermission = "";
    }
  };

  this.deletePermission = function(username, index) {
    user = _.filter(root.users, function(u) {
      return u.username == username
    });
    if (user.length) {
      userIndex = this.users.indexOf(user[0]);

      this.users[userIndex].permissions.splice(index, 1);
    };
  };
});
