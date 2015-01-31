app = angular.module("QueGui", [
  "ngAnimate"
  "ngRoute"
])

# the top nav colors
navColorYellow = "#FCBD4B"
navColorRed = "#FC4B4B"
navColorBlue = "#4BA9FC"
navColorGreen = "#42BF3F"
navColorBrown = "#D481DC"
app.config [
  "$routeProvider"
  ($routeProvider) ->
    $routeProvider.when("/dash",
      templateUrl: "views/dashboard-overview.html"
      controller: "DashboardController"
    ).when("/things",
      templateUrl: "views/thing-card-list.html"
      controller: "ThingsController"
    ).when("/rooms",
      templateUrl: "views/room-list.html"
      controller: "RoomsController"
    ).when("/blocks",
      templateUrl: "views/blocks-list.html"
      controller: "BlockController"
    ).when("/settings",
      templateUrl: "views/settings-list.html"
      controller: "KeysController"
    ).when("/login",
      templateUrl: "views/login.html"
      controller: "LoginController"
    ).when("/queryresults",
      templateUrl: "views/query-results.html"
    ).otherwise redirectTo: "/login"
]
app.controller "navController", ($scope, $rootScope, $http, loginService, $location) ->
  root = this
  @pageId = 1
  @version = ""
  
  # log the original route
  @firstRoute = null
  
  # reference to loginservice
  @user = loginService
  
  # check if this is a new que instance
  @user.isNewInstance (newInstance) ->

  
  # console.log(newInstance)
  
  # get version from backend
  $http(
    method: "get"
    url: "/version"
  ).success (data) ->
    root.version = "v" + data.version
    return

  $rootScope.$on "$routeChangeStart", (event, next, current) ->
    
    # if this is the first route we go to, log it
    # why? later on once auth is done, we will redirect back here.
    root.firstRoute = current.$$route.originalPath  if root.firstRoute is null and current isnt `undefined`
    
    # test to see if the authtoken is persisted
    if root.user and root.user.auth.username is null and sessionStorage and sessionStorage.queKey
      root.user.loginWithKey sessionStorage.queKey, (data) ->
        root.user.auth = data
        
        # serve the dash, because after logging in the login page isn't needed
        $location.url root.firstRoute or "/dash"  if $location.url() is "/login"
        return

    
    # if the user isn't logged in, redirect them to the login page
    $location.url "/login"  if root.user and root.user.auth.username is null and next.$$route.originalPath isnt "/login"
    
    # but, if the user is on the login page, redirect them to the dash as long as their logged in
    $location.url "/dash"  if root.user.auth.username isnt null and $location.url() is "/login"
    
    # which page?
    switch next.$$route.originalPath
      when "/dash"
        root.toPage 0
      when "/things"
        root.toPage 1
      when "/rooms"
        root.toPage 2
      when "/blocks"
        root.toPage 3
      when "/settings"
        root.toPage 4

  @toPage = (id) ->
    
    # set page id
    @pageId = id
    
    # fade the colors in the top navbar
    $(".navbar-que").animate
      backgroundColor: root.getPageColor()
    , 350
    return

  
  # get title area of navbar's color
  @getPageColor = ->
    switch @pageId
      when 0
        return navColorYellow
      when 1
        return navColorGreen
      when 2
        return navColorBlue
      when 3
        return navColorRed
      when 4
        return navColorBrown
      else
        return "transparent"

  
  # get the page's title
  @getPageTitle = ->
    switch @pageId
      when 0
        return (
          title: "Overview"
          desc: "Overview of everything happening on this Que instance"
        )
      when 1
        return (
          title: "My Things"
          desc: "A list of all your things"
        )
      when 2
        return (
          title: "My Rooms"
          desc: "Groups of things that correspond to each physical room the things are in"
        )
      when 3
        return (
          title: "Blocks"
          desc: "Blocks are what tell your things and services how to work"
        )
      when 4
        return (
          title: "Settings"
          desc: "Adjust preferences for this Que instance"
        )
      else
        return (
          title: ""
          desc: ""
        )

  @toPage 0 # go to thing page to start (for now, will be changed back to dashboard later)
  return

app.controller "DashboardController", ($scope, thingService, roomsService, notificationService) ->
  root = $scope
  root.notifications = []
  
  # thing count
  root.thingCount = 0
  root.getThingCount = ->
    thingService.getAllThings (data) ->
      root.thingCount = data.length
      return

    return

  root.getThingCount()
  root.roomCount = 0
  root.getRoomCount = ->
    roomsService.getAllThings (data) ->
      root.roomCount = data.length
      return

    return

  root.getRoomCount()
  
  # notifications
  root.refetch = ->
    notificationService.getNotifications (data) ->
      root.notifications = data
      return

    return

  
  # dismiss notification
  root.dismiss = (id) ->
    notificationService.dismissNotification id
    toDismiss = _.filter(root.notifications, (i) ->
      i.id is id
    )
    root.notifications.splice root.notifications.indexOf(toDismiss[0]), 1
    root.refetch()
    return

  
  # update notifications
  socket.on "backend-data-change", (data) ->
    data is "notify" and root.refetch()
    return

  root.refetch()
  return

app.factory "thingService", ($http) ->
  thingservice =
    cache: {}
    count: 0
    getAllThings: (callback) ->
      r = this
      
      # first, check cache
      unless $.isEmptyObject(@cache)
        
        # console.log("cache", this.cache)
        callback @cache
      else
        
        # console.log("req")
        # fall back to http request
        $http(
          method: "get"
          url: host + "/things/all"
        ).success (data) ->
          
          # console.log("-> done", data)
          r.cache = data.data
          callback data.data
          return

      return

    
    # get thing data
    # try from cache, but fall back onto
    # a http request
    getThingData: (id, callback) ->
      if @cache[id]
        callback @cache[id]
      else
        $http(
          method: "get"
          url: host + "/things/" + id + "/data"
        ).success (data) ->
          @cache = {}
          callback data
          return

      return

    updateThingData: (id, data, callback) ->
      
      # push it back to te server
      socket.emit "push-thing-data-update",
        id: id
        data: data

      
      # clear cache - update was made
      @cache = {}
      return

    
    # $http({
    #   method: "put",
    #   url: host + "/things/" + id + "/data",
    #   data: JSON.stringify(data)
    # }).success(function(data) {
    #   callback(data);
    # });
    
    # reorderThing: function(id, newLocation, callback) {
    #   $http({
    #     method: "get",
    #     url: host + "/things/" + id + "/location/" + newLocation,
    #   }).success(function(data) {
    #     callback(data);
    #   });
    # },
    removeThing: (id, callback) ->
      $http(
        method: "delete"
        url: host + "/things/" + id
      ).success (data) ->
        
        # clear cache - update was made
        @cache = {}
        callback data
        return

      return

  
  # update thing cache
  socket.on "backend-data-change", (payload) ->
    
    # console.log(payload)
    thingservice.cache = payload.data  if payload and payload.type is "thing"
    return

  socket.on "pull-thing-data-update", (changed) ->
    
    # create the item if it doesn't exist
    thingservice.cache[changed.id] = {}  unless thingservice.cache[changed.id]
    
    # update cache
    _.each changed.data, (v, k) ->
      thingservice.cache[changed.id][k] = v
      return

    return

  thingservice

app.factory "tokenService", ($http) ->
  tokenService =
    tokens: {}
    get: (callback) ->
      r = this
      $http(
        method: "get"
        url: host + "/tokens"
      ).success (data) ->
        r.tokens = data
        callback and callback(data)
        return

      return

  tokenService.get()
  tokenService

app.factory "roomsService", ($http) ->
  roomservice =
    cache: {}
    count: 0
    getAllThings: (callback) ->
      r = this
      
      # first, check cache
      unless $.isEmptyObject(@cache)
        
        # console.log("cache")
        callback @cache
      else
        
        # console.log("req")
        # fall back to http request
        $http(
          method: "get"
          url: host + "/rooms/all"
        ).success (data) ->
          
          # console.log(123)
          r.cache = data.data
          callback data.data
          return

      return

    getThingData: (id, callback) ->
      if @cache[id]
        callback @cache[id]
      else
        $http(
          method: "get"
          url: host + "/rooms/" + id + "/data"
        ).success (data) ->
          @cache = {}
          callback data
          return

      return

    addThing: (id, tid, callback) ->
      $http(
        method: "post"
        url: host + "/rooms/" + id + "/addthing"
        data: JSON.stringify(id: tid)
      ).success (data) ->
        @cache = {}
        callback data
        return

      return

    
    # $http({
    #   method: "put",
    #   url: host + "/rooms/" + id + "/data",
    #   data: JSON.stringify(data)
    # }).success(function(data) {
    #   callback(data);
    # });
    add: (data, callback) ->
      $http(
        method: "post"
        url: host + "/rooms/add"
        data: JSON.stringify(data)
      ).success (data) ->
        callback and callback(data)
        return

      return

    remove: (id, callback) ->
      $http(
        method: "delete"
        url: host + "/rooms/" + id
      ).success (data) ->
        callback and callback(data)
        return

      return

    removeThing: (rid, tid, callback) ->
      $http(
        method: "delete"
        url: host + "/rooms/" + rid + "/" + tid
      ).success (data) ->
        @cache = {}
        callback data
        return

      return

    updateUsers: (room, callback) ->
      $http(
        method: "post"
        url: host + "/rooms/" + room.id + "/users"
        data: JSON.stringify(users: room.usersInside)
      ).success (data) ->
        @cache = {}
        callback and callback(data)
        return

      return

    updateThings: (id, things, callback) ->
      $http(
        method: "post"
        url: host + "/rooms/" + id + "/things"
        data: angular.toJson(things: things)
      ).success (data) ->
        @cache = {}
        callback and callback(data)
        return

      return

  
  # update room chache
  socket.on "backend-data-change", (payload) ->
    roomservice.cache = payload.data  if payload and payload.type is "room"
    return

  socket.on "pull-room-data-update", (changed) ->
    
    # create the item if it doesn't exist
    roomservice.cache[changed.id] = {}  unless roomservice.cache[changed.id]
    
    # update cache
    _.each changed.data, (v, k) ->
      roomservice.cache[changed.id][k] = v
      return

    return

  roomservice

app.factory "blockService", ($http) ->
  blockservice =
    cache: {}
    addBlock: (data, callback) ->
      $http(
        method: "post"
        url: host + "/blocks/add"
        data: JSON.stringify(data)
      ).success (data) ->
        @cache = {}
        callback and callback(data.id or data)
        return

      return

    removeBlock: (id, callback) ->
      $http(
        method: "delete"
        url: host + "/blocks/" + id
      ).success (data) ->
        @cache = {}
        callback and callback(data)
        return

      return

    getAllBlocks: (callback) ->
      r = this
      
      # first, check cache
      unless $.isEmptyObject(@cache)
        
        # console.log("cache")
        callback @cache
      else
        
        # console.log("req")
        # fall back to http request
        $http(
          method: "get"
          url: host + "/blocks/all"
        ).success (data) ->
          
          # console.log(123)
          r.cache = data.data
          callback data.data
          return

      return

    getBlockData: (id, callback) ->
      if @cache[id]
        callback @cache[id]
      else
        $http(
          method: "get"
          url: host + "/blocks/" + id + "/code"
        ).success (data) ->
          @cache = {}
          callback data
          return

      return

    updateBlockData: (id, data, callback) ->
      $http(
        method: "put"
        url: host + "/blocks/" + id + "/code"
        data: JSON.stringify(data)
      ).success (data) ->
        @cache = {}
        callback data
        return

      return

  blockservice

app.service "notificationService", ($http) ->
  notificationservice =
    cache: {}
    addNotification: (data, callback) ->
      $http(
        method: "post"
        url: host + "/notify/add"
        data: JSON.stringify(data)
      ).success (data) ->
        callback and callback(data.id or data)
        return

      return

    dismissNotification: (id, callback) ->
      $http(
        method: "delete"
        url: host + "/notify/" + id
      ).success (data) ->
        callback and callback(data)
        return

      return

    getNotifications: (callback) ->
      $http(
        method: "get"
        url: host + "/notify/all"
      ).success (data) ->
        callback data.data
        return

      return

  notificationservice

