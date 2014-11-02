var ThingServer = require("../models/things");
var ServiceServer = require("../models/services");
var BlockServer = require("../models/blocks");
var notify = require("../models/notify");

// create all of the routes for the application
module.exports = function(app, server, argv) {

  // root route (haha that sounds funny)
  app.get("/", function(req, res, next) {
    res.send("<h1>Que Backend</h1>If you're here, this most likely isn't what you want. This is a backend API; for the fontend interface start a web server in public/");
  });

  // set host variable (where the backend is)
  app.get("/js/get-host.js", function(req, res) {
    res.setHeader('content-type', 'text/javascript');

    if (process.env.HEROKU == "true") {
      res.send('var host = "http://que-app-backend.herokuapp.com";');
    } else if (process.env.PORT || argv.port || argv.host || process.env.HOST) {
      hostname = process.env.HOST || argv.host || "127.0.0.1";
      netport = process.env.PORT || argv.port || 8000;
      res.send('var host = "http://' + hostname + ':' + netport + '";');
    } else {
      res.send('var host = "http://127.0.0.1:8000";');
    }
  });

  // create thing server and service server
  var things = new ThingServer();
  var services = new ServiceServer();
  var blocks = new BlockServer(things, services, notify);

  // web socket routes
  var io = require("./sockets.js")(app, server, things, services);
  things.socket = io;
  blocks.socket = io;
  notify.socket = io;

  // http routes
  require("./things")(app, things);
  require("./services")(app, services);
  require("./blocks")(app, blocks);
  require("./notify")(app, notify);
}

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}
