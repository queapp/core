
# create all of the routes for the application

# root route (haha that sounds funny)

# get all auth tokens to 3rd party services

# get all tokens specified in argumnts / variables

# sort through them, and get all tokens

# send matches

# find them from the db

# reformat the tokens

# push all auth tokens on client update

# for each token, upsert the db (add/update if needed)

# set host variable (where the backend is)

# que version route

# create thing server and service server

# web socket routes

# http routes

# auth routes

# natural query routes

# route middleware to make sure a user is logged in
isLoggedIn = (req, res, next) ->
  
  # if user is authenticated in the session, carry on
  return next()  if req.isAuthenticated()
  
  # if they aren't redirect them to the home page
  res.redirect "/"
  return
ThingServer = require("../controllers/things")
RoomServer = require("../controllers/rooms")
BlockServer = require("../controllers/blocks")
UserServer = require("../controllers/users")
notify = require("../controllers/notify")
_ = require("underscore")
pjson = require("../package.json")
Token = require("../models/tokens")
userCan = require("../controllers/auth").canMiddleware
module.exports = (app, server, argv) ->
  app.get "/", (req, res, next) ->
    res.send "<h1>Que Backend</h1>If you're here, this most likely isn't what you want. This is a backend API; for the fontend interface start a web server in public/"
    return

  app.get "/tokens", userCan("token.view"), (req, res) ->
    all = _.extend(process.env, argv)
    matches = {}
    _.each all, (v, k) ->
      matches[k] = v  if k.indexOf("token") isnt -1
      return

    if _.keys(matches).length
      res.send matches
    else
      Token.find {}, (err, all) ->
        newFormat = {}
        all.forEach (token) ->
          newFormat[token.name] = token.data
          return

        res.send newFormat
        return

    return

  app.put "/tokens", userCan("token.edit"), (req, res) ->
    if req.body
      _.each req.body, (v, k) ->
        return  if v.length is 0
        token = new Token(
          name: k
          data: v
        )
        upsertData = token.toObject()
        delete upsertData._id

        Token.update
          name: k
        , upsertData,
          upsert: true
        , (err) ->
          err and res.send("DB Error.")
          return

        return

      res.send "OK"
    else
      res.send "No body."
    return

  app.get "/js/get-host.js", (req, res) ->
    res.setHeader "content-type", "text/javascript"
    if process.env.HEROKU is "true"
      res.send "var host = \"http://que-app-backend.herokuapp.com\";"
    else if process.env.PORT or argv.port or argv.host or process.env.HOST
      hostname = process.env.HOST or argv.host or "127.0.0.1"
      netport = process.env.BACKENDPORT or argv.backendport or process.env.PORT or argv.port or 8000
      res.send "var host = \"http://" + hostname + ":" + netport + "\";"
    else
      res.send "var host = \"http://127.0.0.1:8000\";"
    return

  app.get "/version", (req, res) ->
    res.json version: pjson.version
    return

  things = new ThingServer()
  rooms = new RoomServer()
  blocks = new BlockServer(things, rooms, rooms, notify)
  users = new UserServer()
  io = require("./sockets.js")(app, server, things, rooms)
  things.socket = io
  rooms.socket = io
  blocks.socket = io
  notify.socket = io
  require("./things") app, things
  require("./rooms") app, rooms
  require("./blocks") app, blocks
  require("./users") app, users, require("../models/sessiontoken"), argv
  require("./notify") app, notify
  require("./auth") app
  require("./nlp-query") app, things
  io
