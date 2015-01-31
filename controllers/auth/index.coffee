###*
Authentication Controller. THis module handles user permission checking
server-side.
@module controller/auth
###
_ = require("underscore")
sessionToken = require("../../models/sessiontoken")
wildcard = require("wildcard")
tokenexpiresafter = 60 * 60 * 24 # 1 day

###*
Checks if the current user specified has permissions to perform the specified
permission
@param {Object}   auth       authentication object representing current user
session
@param {String}   permission The permission object to check, in standard Que
permission form
@param {Function} cb         Callback in response, with an error string then
data if applicable
@alias module:controller/auth.can
###
canUser = (auth, permission, cb) ->
  sessionToken.findOne
    key: auth
  , (err, token) ->
    if err
      cb err
      return
    
    # check for matches
    if token
      
      # get creation time
      createdat = new Date(token.toObject().createdAt.toString())
      
      # check for token expiration
      if createdat.getTime() / 1000 + tokenexpiresafter < new Date().getTime() / 1000
        sessionToken.remove
          key: auth
        , (err) ->
          cb err or "Token Expired - Not Authenticated"
          return

      resp = []
      _.each token.permissions, (p) ->
        resp.push wildcard(p, permission)
        return

      cb null, !!_.filter(resp, (x) ->
        x.length isnt `undefined`
      ).length
    else
      cb "Not Authenticated"
    return

  return

module.exports =
  can: canUser
  
  ###*
  wraps a permission checker into a middleware-compatable format. The user is
  referenced internally from the user session.
  @param {string} permission The permission to check against
  ###
  canMiddleware: (permission) ->
    root = this
    (req, res, next) ->
      permission = permission.replace("#id", req.param("id"))
      canUser req.header("authentication"), permission, (err, allowed) ->
        if err
          next err
        else unless allowed
          next "Permission Denied."
        else
          next()
        return

      return
