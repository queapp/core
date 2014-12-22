var ThingServer = require("../controllers/things");
var ServiceServer = require("../controllers/services");
var BlockServer = require("../controllers/blocks");
var UserServer = require("../controllers/users");
var notify = require("../controllers/notify");
var _ = require("underscore");

var pjson = require('../package.json');

var Token = require("../models/token");
var userCan = require("../controllers/auth").canMiddleware;

// create all of the routes for the application
module.exports = function(app, server, argv) {

  // root route (haha that sounds funny)
  app.get("/", function(req, res, next) {
    res.send("<h1>Que Backend</h1>If you're here, this most likely isn't what you want. This is a backend API; for the fontend interface start a web server in public/");
  });

  // get all auth tokens to 3rd party services
  app.get("/tokens", userCan("token.view"), function(req, res) {
    // get all tokens specified in argumnts / variables
    all = _.extend(process.env, argv);
    matches = {};

    // sort through them, and get all tokens
    _.each(all, function(v, k) { if (k.indexOf("token") !== -1) matches[k] = v; });

    if (_.keys(matches).length) {
      // send matches
      res.send(matches);
    } else {
      // find them from the db
      Token.find({}, function(err, all) {
        // reformat the tokens
        var newFormat = {};
        all.forEach(function(token) { newFormat[token.name] = token.data; });
        res.send(newFormat);
      });
    };

  });

  // push all auth tokens on client update
  app.put("/tokens", userCan("token.edit"), function(req, res) {
    if (req.body) {
      // for each token, upsert the db (add/update if needed)
      _.each(req.body, function(v, k) {
        if (v.length === 0) return;
        var token = new Token({name: k, data: v});
        var upsertData = token.toObject();
        delete upsertData._id;
        Token.update({name: k}, upsertData, {upsert: true}, function(err) {
          err && res.send("DB Error.");
        });
      });
      res.send("OK");
    } else {
      res.send("No body.");
    }
  });

  // set host variable (where the backend is)
  app.get("/js/get-host.js", function(req, res) {
    res.setHeader('content-type', 'text/javascript');

    if (process.env.HEROKU == "true") {
      res.send('var host = "http://que-app-backend.herokuapp.com";');
    } else if (process.env.PORT || argv.port || argv.host || process.env.HOST) {
      hostname = process.env.HOST || argv.host || "127.0.0.1";
      netport = process.env.BACKENDPORT || process.env.PORT || argv.port || 8000;
      res.send('var host = "http://' + hostname + ':' + netport + '";');
    } else {
      res.send('var host = "http://127.0.0.1:8000";');
    }
  });

  // que version route
  app.get("/version", function(req, res) { res.json({version: pjson.version}); });

  // create thing server and service server
  var things = new ThingServer();
  var services = new ServiceServer();
  var blocks = new BlockServer(things, services, notify);
  var users = new UserServer();

  // web socket routes
  var io = require("./sockets.js")(app, server, things, services);
  things.socket = io;
  blocks.socket = io;
  notify.socket = io;

  // http routes
  require("./things")(app, things);
  require("./services")(app, services);
  require("./blocks")(app, blocks);
  require("./users")(app, users);
  require("./notify")(app, notify);

  // auth routes
  require("./auth")(app);

  return io;
}

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}
