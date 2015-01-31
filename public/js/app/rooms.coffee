app = angular.module("QueGui")
app.controller "RoomsController", ($scope, $http, roomsService, thingService, $interval, $document) ->
  root = this
  @rooms = []
  @selectedThing = null
  
  # service authentication key
  @authKey = null
  
  # creating new rooms
  @newRoom = {}
  
  # process newly aquired data from server
  # takes each thing within each room and
  # fills in the missing data for conveinence
  @processNewData = (things, data) ->
    _.each data, (rm, i) ->
      _.each rm.things, (th, j) ->
        thing = _.filter(things, (i) ->
          i.id is th.id
        )
        th.thing = thing.length and thing[0] or {}
        return

      return

    data

  
  # get all data from server
  roomsService.getAllThings (data) ->
    thingService.getAllThings (things) ->
      
      # process data
      root.rooms = root.processNewData(things, data)
      return

    return

  
  # given a data type, get the textbox type it would go into
  @getTypeFor = (value) ->
    if value.type
      value.type
    else
      switch typeof value.value
        when "number"
          return "number"
        when "boolean"
          return "checkbox"
        else
          return "text"

  
  # update backend on keypress
  @updateThingData = (id, key, value, callback) ->
    data = {}
    data[key] = value
    roomsService.update id, data, callback or ->

    return

  
  # convert from CamelCase or underscore-format to normal, smaced words
  @convertIntoSpaces = (string) ->
    
    # insert a space between lower & upper
    
    # space before last upper in a sequence followed by lower
    
    # uppercase the first character
    # insert a space between lower & upper
    
    # space before last upper in a sequence followed by lower
    
    # uppercase the first character
    string = string.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/\b([A-Z]+)([A-Z])([a-z])/, "$1 $2$3").replace(/^./, (str) ->
      str.toUpperCase()
    ).replace(/([a-z])([A-Z])/g, "$1 $2").replace(/\b([A-Z]+)([A-Z])([a-z])/, "$1 $2$3").replace(/^./, (str) ->
      str.toUpperCase()
    )
    string.replace("-", " ").replace "_", " "

  @removeThing = (rid, tid, tindex) ->
    room = root.rooms.filter((i) ->
      i.id is rid
    )
    
    # room[0].things.splice(tindex, 1);
    delete room[0].things[tindex]  if room.length
    
    # room[0].things[tindex].name = "Deleted";
    roomsService.removeThing rid, tid, ->

    return

  
  # add a new thing to the room
  @addToRoom = (id, name) ->
    thingService.getAllThings (things) ->
      
      # look for possible thins that match the name requirement
      possibles = _.filter(things, (i) ->
        i.name is name
      )
      if possibles.length
        roomsService.addThing id, possibles[0].id, (data) ->
          
          # add the thing to the room
          _.each _.filter(root.rooms, (i) ->
            i.id is id
          ), (i) ->
            i.things.push possibles[0]
            return

          return

      return

    return

  @getRoomId = (name) ->
    id = _.filter(root.rooms, (room) ->
      room.name is name
    )
    (if id.length then id[0].id else null)

  
  # returns each room the specified thing isn't
  # part of; Used for the selection boxes to add
  # a thing to a specified room on thing page.
  @onlyNotIn = (rooms, thing) ->
    _.filter rooms, (r) ->
      
      # each room that doesn't contain the specified thing
      not _.filter(r.things, (t) ->
        t.id is thing
      ).length


  
  # create new room
  @add = ->
    roomsService.add
      name: @newRoom.name
      desc: @newRoom.desc
      tags: (@newRoom.tags or "").split(" ")
      things: []
    , ->
      $("#addRoomModal").modal "hide"
      root.newRoom = {}
      return

    return

  
  # remove a room
  @remove = (id) ->
    roomsService.remove id
    return

  
  # a user entered the room
  @enterRoom = (user, room) ->
    
    # add username to list of users in room
    room.usersInside.push user.auth.username
    roomsService.updateUsers room
    
    # for each thing in the room...
    _.each room.things, (thing) ->
      
      # ... and each control specifed in the thing ...
      _.each thing.enter, (vv, kn) ->
        console.log thing, vv, kn
        
        # update the control.
        obj = {}
        obj[kn] = vv
        thingService.updateThingData thing.id, obj
        return

      return

    return

  
  # a user left the room
  @leaveRoom = (user, room) ->
    
    # remove username to list of users in room
    room.usersInside.splice room.usersInside.indexOf(user.auth.username), 1
    roomsService.updateUsers room
    
    # for each thing in the room...
    _.each room.things, (thing) ->
      
      # ... and each control specifed in the thing ...
      _.each thing.leave, (vv, kn) ->
        
        # update the control.
        obj = {}
        obj[kn] = vv
        thingService.updateThingData thing.id, obj
        return

      return

    return

  
  # update things for a room
  @updateThings = (room) ->
    roomsService.updateThings room.id, room.things, ->
      $(".modal").modal "hide" # hide modal
      return

    return

  
  # disable of enable controls
  @disableOrEnableControls = (thing, which, mode) ->
    if mode
      thing[which] = thing.thing.data
    else
      thing[which] = {}
    return

  
  # the backend has new data for us
  socket.on "backend-data-change", (payload) ->
    if payload and payload.type is "room"
      
      # update the payload data
      thingService.getAllThings (things) ->
        root.rooms = root.processNewData(things, payload.data)
        return

      
      # update scope
      $scope.$apply()
    return

  return

