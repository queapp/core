express = require("express")
http = require("http")
passport = require("passport")
cors = require("cors")

# express middleware
bodyParser = require("body-parser")
cookieParser = require("cookie-parser")
session = require("express-session")
less = require("less-middleware")
coffeeMiddleware = require('coffee-middleware');

# parse arguments
argv = require("minimist")(process.argv.slice(2))

# connect to database
db = require("./models")
if process.env.MONGOURI or argv.db
  db process.env.MONGOURI or argv.db
else
  throw new Error("Please set the MONGOURI environment variable to the uri of your mongodb instance.")
require("./controllers/logger") argv, (logger) ->
  routes = require("./routes")
  app = express()

  # some middleware
  app.use cors()
  app.use bodyParser.json()
  app.use session(
    secret: "secret"
    saveUninitialized: true
    resave: true
  )

  # less and coffeescript middleware
  app.use less(__dirname + "/public")
  app.use(coffeeMiddleware({
    src: __dirname + "/public",
    compress: true
  }));

  # static hosting of /public
  app.use express.static(__dirname + "/public")

  # log all http requests
  app.use require("winston-request-logger").create(logger)

  # create http Server
  server = http.Server(app)

  # create all of the routes
  io = routes(app, server, argv)

  # run server
  server.listen process.env.PORT or 8000, ->

    # log the port
    console.log "Listening on port %d", server.address().port
    return

  return
