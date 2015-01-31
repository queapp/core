###*
Block Helpers. This module is injected into each running block and serves as
its api to Que's functions.
@module controller/blocks/helpers
###
_ = require("underscore")
request = require("request")

# some small helper apis to make outside interaction
# possible inside of a code block
module.exports = (socket, things, services, notifys, rooms, item) ->
  
  ###*
  Iterates over a thing container searching for the specified tag.
  @param {string}   tag The tag to search with
  @param {Function} cb  This callback is called once for each thing
  iteration, passing the thing first and the
  iteration count second
  ###
  getThingByTag: (tag, cb) ->
    things.get null, (data) ->
      
      # get all things with the specified tag
      fltr = _.filter(data, (item) ->
        _.contains item.tags, tag
      )
      
      # iterate over each thing
      fltr.forEach (f, ct) ->
        cb f, ct
        return

      return

    return

  
  ###*
  Iterates over a thing container searching for the specified id. (Well,
  this should only 'iterate' once)
  @param {string}   id The id to search for
  @param {Function} cb  This callback is called once for each thing
  iteration, passing the thing first and the
  iteration count second
  ###
  getThingById: (id, cb) ->
    things.get null, (data) ->
      
      # get all things with the specified id
      fltr = _.filter(data, (item) ->
        item.id is id
      )
      
      # iterate over each thing
      fltr.forEach (f, ct) ->
        cb f, ct
        return

      return

    return

  
  ###*
  Iterates over a room container searching for the specified tag.
  @param {string}   tag The tag to search with
  @param {Function} cb  This callback is called once for each room
  iteration, passing the room first and the
  iteration count second
  ###
  getRoomByTag: (tag, cb) ->
    rooms.get null, (data) ->
      
      # get matching rooms
      fltr = _.filter(data, (item) ->
        _.contains item.tags, tag
      )
      
      # call the callback for each one
      _.each fltr, (f, ct) ->
        cb f, ct
        return

      return

    return

  
  ###*
  Iterates over a room container searching for the specified id. (Well,
  this should only 'iterate' once)
  @param {string}   id The id to search for
  @param {Function} cb  This callback is called once for each room
  iteration, passing the room first and the
  iteration count second
  ###
  getRoomById: (id, cb) ->
    rooms.get null, (data) ->
      
      # get matching rooms
      fltr = _.filter(data, (item) ->
        item.id is id
      )
      
      # call the callback for each one
      _.each fltr, (f, ct) ->
        cb f, ct
        return

      return

    return

  
  ###*
  Sets a control's value within a thing.
  @param {number}   id       The id of the thing to modify
  @param {string}   key      The internal control name that should be
  modified. This can be found by looking at the
  placeholder text of textbox-based controls or
  by hovering your mouse over the control name
  in the the things view.
  @param {string|number|boolean}   value    The value to assign the the
  specified key name. If a boolean
  is passed the control will take
  the form of a button. Any other
  type will take the form of a
  textbox.
  @param {Function} callback Callback that returns a boolean success flag.
  ###
  setThingValue: (id, key, value, callback) ->
    
    # set up the object
    obj = {}
    obj[key] = value: value
    
    # update
    things.get id, (thing) ->
      if thing.data[key].value isnt value
        things.update id, obj, (data) ->
          callback and (data and callback(true) or callback(null))
          return

      return

    return

  
  # get and set persistant variables intividual to that block
  get: (elem) ->
    item.data[elem]

  set: (elem, value) ->
    item.data = []  unless item.data
    item.data[elem] = value
    true

  
  ###*
  Returns a convience object containing easy-to-call versions of each
  action's trigger and detriggr methods.
  @param {object} thing The thing to extract the actions from.
  ###
  getActions: (thing) ->
    actions = {}
    
    # format
    thing.actions.forEach (action) ->
      actions[action.name] =
        trigger: (cb) ->
          
          # console.log("TRIGGER", JSON.stringify(action));
          request action.trigger, (err, resp, body) ->
            try
              cb and cb(err, resp, JSON.parse(body))
            return

          return

        detrigger: (cb) ->
          
          # console.log("DETRIGGER", JSON.stringify(action));
          request action.detrigger, (err, resp, body) ->
            try
              cb and cb(err, resp, JSON.parse(body))
            return

          return

      return

    actions

  
  ###*
  Indicate that a user has entered or left a room.
  @param  {object}   room     The room in which to do the operation.
  @param  {string|boolean}   action   The action to take - if equal to
  'enter', 'e', or a truthy value, the
  user should enter the room, anything
  else means to leave the room.
  @param  {string}   username The username to enter/leave the room.
  @param  {Function} callback Optional callback on operation completion.
  ###
  room: (room, action, username, callback) ->
    
    # add or remove username
    if action or action is "enter" or action is "e"
      
      # add, but make sure user isn't already in the list
      room.usersInside.push username  if room.usersInside.indexOf(username) is -1
    else
      
      # remove
      room.usersInside.splice room.usersInside.indexOf(username), 1
    
    # update backend
    rooms.updateUsers room.id, room.usersInside, ->
      
      # update frontend
      rooms.get null, (all) ->
        socket.emit "backend-data-change",
          type: "room"
          data: all

        return

      
      # callback
      callback and callback()
      return

    return

  
  ###*
  Log to the block console.
  @param  {*} msg Data to log
  ###
  log: (msg) ->
    socket and socket.emit("block-log",
      id: item.id
      type: "info"
      when: new Date()
      msg: JSON.stringify(msg)
    )
    return

  
  ###*
  Log to the block console, but with a warning log level.
  @param  {*} msg Data to log
  ###
  warn: (msg) ->
    socket and socket.emit("block-log",
      id: item.id
      type: "warn"
      when: new Date()
      msg: msg.toString()
    )
    return

  
  ###*
  Log to the block console, but with an error log level.
  @param  {*} msg Data to log
  ###
  error: (msg) ->
    socket and socket.emit("block-log",
      id: item.id
      type: "error"
      when: new Date()
      msg: msg.toString()
    )
    return

  
  ###*
  send a notification to the user, which is displayed onto the Dashboard
  page
  @param  {string} msg   The body of the notification
  @param  {string} title The notification title
  ###
  notify: (msg, title) ->
    notifys.createNotify msg, title
    return

  
  ###*
  Check to see if the time specified is the current time.
  @param {number}   h        Hours of the time.
  @param {number}   m        Minutes of the time.
  @param {number}   s        Seconds of the time.
  @param {Function} callback Callback when the time matches what has been
  indicated.
  ###
  whenTime: (h, m, s, callback) ->
    d = new Date()
    callback()  if d.getHours() is h and d.getMinutes() is m and d.getSeconds() is s
    return

  
  ###*
  canvas drawing functions
  @param {number} id  Thing id to draw to
  @param {string} key The control name within the thing with the canvas to
  be updated.
  ###
  getCanvas: (id, key) ->
    return null  unless socket
    clear: (x, y, w, h) ->
      socket.emit "canvas-update",
        id: id
        key: key
        action: "clear"
        x: x
        y: y
        w: w
        h: h

      return

    line: (nodes, fill, stroke, fillorstroke) ->
      socket.emit "canvas-update",
        id: id
        key: key
        action: "line"
        nodes: nodes
        fillColor: fill
        strokeColor: stroke
        finished: fillorstroke

      return

    rect: (x, y, w, h, fill, stroke) ->
      socket.emit "canvas-update",
        id: id
        key: key
        action: "rect"
        x: x
        y: y
        w: w
        h: h
        fillColor: fill
        strokeColor: stroke

      return

    imageFromUrl: (url, x, y) ->
      socket.emit "canvas-update",
        id: id
        key: key
        action: "image"
        src: url
        x: x
        y: y

      return

    text: (text, x, y) ->
      socket.emit "canvas-update",
        id: id
        key: key
        action: "text"
        text: text
        x: x
        y: y
        fillColor: fill
        strokeColor: stroke

      return

  
  ###*
  Abstrated underscore.js utility functions
  @type {object}
  ###
  underscore: _
