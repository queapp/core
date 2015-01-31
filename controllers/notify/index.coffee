###*
Notify controller. This module manages notification creation, reading, and
dismissal (deleting).
@module controller/notify
###
_ = require("underscore")
Notify = require("../../models/notify")
module.exports =
  socket: null # the websocket
  
  ###*
  Create a new notification to be shown to the user
  @param {string}   body  The notification textual content
  @param {string}   title The notification title
  @param {Function} done  Optional callback function - returns the newly
  created notification's id, or an error.
  ###
  createNotify: (body, title, done) ->
    root = this
    
    # get notify collection contents
    Notify.find (err, docs) ->
      
      # was there an error?
      done err  if err and done
      
      # convert the document list into an object list
      ret = _.map(docs, (doc) ->
        
        # convert to object from model
        # for encapsulation
        ob = doc.toObject()
        delete ob._id

        ob
      )
      
      # get max id
      # TODO: Implementation is a bit flawed.
      maxId = _.max(ret, (i) ->
        i.id
      ).id or 0
      
      # initalize the new notify
      item =
        id: ++maxId
        title: title
        body: body
        icon: null

      
      # add notify
      notify = new Notify(item)
      notify.save (err, d) ->
        
        # tell the frontend it needs to pull in a new notify
        root.socket and root.socket.emit("backend-data-change",
          type: "notify"
          data: docs
        )
        
        # callback
        done and done(item.id)
        return

      return

    return

  
  ###*
  dismiss (delete) a notification from the collection
  @param {number}   id   Notification id to dismiss
  @param {Function} done Optional callback - returns an error if applicable.
  ###
  dismissNotify: (id, done) ->
    Notify.remove
      id: id
    , (err) ->
      done and done(err)
      return

    return

  
  ###*
  Gets all active notifications from the collection.
  @param  {Function} done Callback - returns an error as the first argument,
  and the object list second.
  ###
  get: (done) ->
    Notify.find (err, docs) ->
      
      # was there an error?
      done err  if err
      
      # convert the document list into an object list
      # and return it through the callback
      done null, _.map(docs, (doc) ->
        
        # convert to object from model
        # for encapsulation
        ob = doc.toObject()
        delete ob._id

        ob
      )
      return

    return

  createResponsePacket: (status, data) ->
    _.extend
      status: status or "OK"
      msg: null
    , data or {}
