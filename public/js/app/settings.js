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

app.controller("UsersController", function($scope, $http, userService) {
  var root = this;

  // all users
  this.users = [];

  // pull down all user info
  this.reload = function() {
    userService.getAllUsers(function(users) {
      root.users = users;
    });
  };
  this.reload();

  // new permissions
  this.newPermission = "";

  // potential new user
  this.newUser = {};

  // add a new user
  this.addUser = function() {
    userService.addUser(this.newUser, function() {
      // add user
      root.users.push(root.newUser);
      root.newUser = {};

      // hide modal on success
      $(".newuser-modal").modal('hide');
    });
  };

  // delete a user
  this.deleteUser = function(username) {
    user = _.filter(root.users, function(u) {
      return u.username == username
    });
    if (user.length) {

      // remove user
      userIndex = this.users.indexOf(user[0]);
      this.users.splice(userIndex, 1);

      // and, also on backend too
      userService.deleteUser(username);
    };
  };

  // add permission
  this.addPermission = function(username, permission) {
    user = _.filter(root.users, function(u) {
      return u.username == username
    });
    if (user.length) {
      userIndex = this.users.indexOf(user[0]);

      // check to make sure that permissions is an array
      if (typeof this.users[userIndex].permissions !== "object")
        this.users[userIndex].permissions = []

      // add permission
      this.users[userIndex].permissions.push(permission);

      // remove from newpermissions
      this.newPermission = "";
    }
  };

  // delete a permission
  this.deletePermission = function(username, index) {
    user = _.filter(root.users, function(u) {
      return u.username == username
    });
    if (user.length) {
      userIndex = this.users.indexOf(user[0]);

      this.users[userIndex].permissions.splice(index, 1);
    };
  };

  // push all permission/user data to backend
  this.update = function(username, done) {
    // find user
    user = _.filter(root.users, function(u) {
      return u.username == username
    });
    if (user.length) {
      userIndex = this.users.indexOf(user[0]);

      // update user
      userService.updateUser(username, this.users[userIndex], function(d) {
        // reload
        // root.reload();

        // callback
        done && done(d);
      });

    };
  };
});

app.factory("userService", function($http) {
  return {
    getAllUsers: function(callback) {
      $http({
        method: "get",
        url: host + "/users/all",
      }).success(function(data) {
        callback(data.data);
      });
    },

    updateUser: function(username, data, callback) {
      $http({
        method: "put",
        url: host + "/users/" + username,
        data: angular.toJson(data)
      }).success(function(data) {
        callback(data);
      });
    },

    addUser: function(data, callback) {
      $http({
        method: "post",
        url: host + "/users/add",
        data: angular.toJson(data)
      }).success(function(data) {
        callback && callback(data);
      });
    },

    deleteUser: function(username, callback) {
      $http({
        method: "delete",
        url: host + "/users/" + username,
      }).success(function(data) {
        callback && callback(data);
      });
    }
  };
});
