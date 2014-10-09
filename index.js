var express = require("express");
var passport = require('passport');
var cors = require('cors');

var bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');
var session = require('express-session');

var routes = require("./routes");

var app = express();
app.use(bodyParser.json());

// some middleware
app.use(cors());


// create all of the routes
routes(app);

// run server
var server = app.listen(process.env.PORT || 8000, function() {
  console.log('Listening on port %d', server.address().port);
});
