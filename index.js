var express = require("express");
var passport = require('passport');
var cors = require('cors');

var bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');
var session = require('express-session');

var routes = require("./routes");

var app = express();

// some middleware
app.use(cors());
app.use(bodyParser.json());
app.use(session({secret: "secret", saveUninitialized: true, resave: true}));
app.use(express.static(__dirname+'/public'));


// create all of the routes
routes(app);

// run server
var server = app.listen(process.env.PORT || 8000, function() {
  console.log('Listening on port %d', server.address().port);
});
