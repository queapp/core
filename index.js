var express = require("express");
var http = require("http");
var passport = require('passport');
var cors = require('cors');

var bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');
var session = require('express-session');

var db = require("./routes/models/persistant/provider");
db.connect('mongodb://dev:dev@ds045970.mongolab.com:45970/queapp')

require("./logger")();
var routes = require("./routes");

var app = express();

// some middleware
app.use(cors());
app.use(bodyParser.json());
app.use(session({secret: "secret", saveUninitialized: true, resave: true}));
app.use(express.static(__dirname+'/public'));

// log all http requests
app.use(function(req, res, next) {
  console.log(req.method, req.url, req.statusCode, "->", req.hostname);
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
