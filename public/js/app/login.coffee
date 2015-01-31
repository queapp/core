app = angular.module "QueGui"
app.controller "LoginController", ($scope, $http, loginService) ->
  root = this
  @username = ""
  @password = ""
  @badlogin = false
  @login = ->
    loginService.login root.username, root.password, (status) ->
      root.badlogin = true  unless status
      return

    return

  return

app.factory "loginService", ($http, $location) ->
  auth:
    username: null

  newInstance: false
  login: (user, pass, callback) ->
    root = this
    $http(
      method: "POST"
      url: host + "/auth"
      data:
        name: user
        pass: pass
    ).success (data) ->

      # was is successful?
      if data.key

        # save it all into the auth area
        root.auth = data

        # set header
        $http.defaults.headers.common.Authentication = root.auth.key or ""

        # set sessionstorage
        sessionStorage.queKey = root.auth.key  if sessionStorage

        # go to the dash
        $location.url "/dash"
        callback and callback(true)
      else

        # wrong credentials
        callback and callback(false)
      return

    return

  loginWithKey: (key, callback) ->
    root = this
    $http(
      method: "GET"
      url: host + "/auth/whoami"
      headers:
        Authentication: key
    ).success (data) ->
      if data.key isnt null

        # save it all into the auth area
        root.auth = data

        # set header
        $http.defaults.headers.common.Authentication = key or ""

        # set sessionstorage
        sessionStorage.queKey = key  if sessionStorage

        # callback
        callback and callback(data)
      return

    return

  logout: ->
    root = this
    $http(
      method: "DELETE"
      url: host + "/auth"
      headers:
        Authentication: @auth.key or ""
    ).success (data) ->

      # logout
      root.auth = username: null

      # forget about that auth header
      $http.defaults.headers.common.Authentication = ""

      # set sessionstorage
      sessionStorage.queKey = `undefined`  if sessionStorage

      # go back to the login screen
      $location.url "/login"
      return

    return


  # if user has permission to do something
  # if permission is thing.edit: thing.edit, thing.*, * all work
  can: (permission) ->
    if typeof @auth.permissions is "object"
      resp = []
      _.each @auth.permissions, (p) ->
        resp.push matchWildcard(p, permission).length
        return


      # console.log(permission, resp); // debug
      _.filter(resp, (x) ->
        x isnt `undefined`
      ).length
    else
      false


  # is this a new que instance?
  isNewInstance: (callback) ->
    root = this
    $http(
      method: "GET"
      url: host + "/users/any"
    ).success (data) ->
      root.newInstance = data.newInstance
      callback and callback(data.newInstance)
      return

    return
