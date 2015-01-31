app = angular.module("QueGui")
app.controller "KeysController", ($scope, $http) ->
  root = this
  
  # store all key info
  root.keys = {}
  
  # keys that have been validated
  root.validated = {}
  
  # get keys from server
  $http(
    method: "GET"
    url: "/tokens"
  ).success (data) ->
    root.keys = data
    root.validateAll()
    return

  @updateKeys = ->
    @validateAll()
    
    # do the http request
    $http
      method: "put"
      url: "/tokens"
      data: JSON.stringify(root.keys)

    return

  
  # update all key validations
  @validateAll = ->
    root.validated.sparktoken = (root.keys.sparktoken or "").length is 40
    return

  return

app.controller "UsersController", ($scope, $http, userService) ->
  root = this
  
  # all users
  @users = []
  
  # pull down all user info
  @reload = ->
    userService.getAllUsers (users) ->
      root.users = users
      return

    return

  @reload()
  
  # new permissions
  @newPermission = ""
  
  # potential new user
  @newUser = {}
  
  # add a new user
  @addUser = ->
    userService.addUser @newUser, ->
      
      # add user
      root.users.push root.newUser
      root.newUser = {}
      
      # hide modal on success
      $(".newuser-modal").modal "hide"
      return

    return

  
  # delete a user
  @deleteUser = (username) ->
    user = _.filter(root.users, (u) ->
      u.username is username
    )
    if user.length
      
      # remove user
      userIndex = @users.indexOf(user[0])
      @users.splice userIndex, 1
      
      # and, also on backend too
      userService.deleteUser username
    return

  
  # add permission
  @addPermission = (username, permission) ->
    user = _.filter(root.users, (u) ->
      u.username is username
    )
    if user.length
      userIndex = @users.indexOf(user[0])
      
      # check to make sure that permissions is an array
      @users[userIndex].permissions = []  if typeof @users[userIndex].permissions isnt "object"
      
      # add permission
      @users[userIndex].permissions.push permission
      
      # remove from newpermissions
      @newPermission = ""
    return

  
  # delete a permission
  @deletePermission = (username, index) ->
    user = _.filter(root.users, (u) ->
      u.username is username
    )
    if user.length
      userIndex = @users.indexOf(user[0])
      @users[userIndex].permissions.splice index, 1
    return

  
  # push all permission/user data to backend
  @update = (username, done) ->
    
    # find user
    user = _.filter(root.users, (u) ->
      u.username is username
    )
    if user.length
      userIndex = @users.indexOf(user[0])
      
      # update user
      userService.updateUser username, @users[userIndex], (d) ->
        
        # reload
        # root.reload();
        
        # callback
        done and done(d)
        return

    return

  
  # check permission validity
  @checkPermissionValidity = ->
    
    # check for spaces
    return false  if @newPermission.split(" ").length > 1
    return false  if @newPermission.substr(-1).trim() is ""
    
    # check for plurals in first section
    return false  if @newPermission.split(".")[0].substr(-1) is "s"
    
    # otherwise, it seems ok
    true

  
  # check a potential password for validity
  @checkForValidPassword = (pass) ->
    password = pass or @newUser.pass
    typeof password is "string" and password.length > 5

  return

app.factory "userService", ($http) ->
  getAllUsers: (callback) ->
    $http(
      method: "get"
      url: host + "/users/all"
    ).success (data) ->
      callback data.data
      return

    return

  updateUser: (username, data, callback) ->
    $http(
      method: "put"
      url: host + "/users/" + username
      data: angular.toJson(data)
    ).success (data) ->
      callback data
      return

    return

  addUser: (data, callback) ->
    $http(
      method: "post"
      url: host + "/users/add"
      data: angular.toJson(data)
    ).success (data) ->
      callback and callback(data)
      return

    return

  deleteUser: (username, callback) ->
    $http(
      method: "delete"
      url: host + "/users/" + username
    ).success (data) ->
      callback and callback(data)
      return

    return

