var express = require("express");
var http = require("http");
var passport = require('passport');
var cors = require('cors');

// express middleware
var bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');
var session = require('express-session');

// parse arguments
var argv = require('minimist')(process.argv.slice(2));


// connect to database
var db = require("./models/persistant/provider");
if (process.env.MONGOURI || argv.db) {
  db.connect(process.env.MONGOURI || argv.db);
} else {
  throw new Error("Please set the MONGOURI environment variable to the uri of your mongodb instance.");
}

require("./models/logger")();
var routes = require("./routes");

var app = express();

// some middleware
app.use(cors());
app.use(bodyParser.json());
app.use(session({secret: "secret", saveUninitialized: true, resave: true}));
app.use(express.static(__dirname+'/public'));

// log all http requests
app.use(function(req, res, next) {
  console.tolog(req.method, req.url, req.statusCode, "->", req.hostname);
  next();
});

// create http Server
var server = http.Server(app);

// create all of the routes
routes(app, server);

// run server
server.listen(process.env.PORT || 8000, function() {
  console.log('Listening on port %d', server.address().port);
});
