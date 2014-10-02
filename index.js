var express = require("express");
var cors = require('cors');

var bodyParser = require("body-parser");
var ThingServer = require("./thingcontainer");

var app = express();
app.use(bodyParser.json());

var things = new ThingServer();

// cors
app.use(cors());

// root placeholder
app.get("/", function(req, res, next) {
  res.send("<h1>Que Backend</h1>If you're here, this most likely isn't what you want. This is a backend API; for the fontend interface start a web server in public/");
});


// get all things
app.get("/things/all", function(req, res, next) {
  things.getThings(null, function(data) {
    res.send( {data: data} );
  });
});



// THING STUFF

// add a new thing
app.post("/things/add", function(req, res, next) {
  things.addThing(req.body, function(id) {
    res.send( things.createResponsePacket("OK", {id: id}) );
  });
});

// list a specific thing's data
app.get("/things/:id/data", function(req, res, next) {
  things.getThings(parseInt(req.param("id")), function(data) {
    res.send( data && data.data || things.createResponsePacket("NOHIT") );
  });
});

// update thing data
app.put("/things/:id/data", function(req, res, next) {
  things.updateThings(parseInt(req.param("id")), req.body, function() {
    res.send( things.createResponsePacket() );
  });
});

// reorder things
app.get("/things/:id/location/:new", function(req, res, next) {
  things.reorderThing(parseInt(req.param("id")), parseInt(req.param("new")), function() {
    res.send( things.createResponsePacket() );
  });
});


// run server
var server = app.listen(process.env.PORT || 8000, function() {
  console.log('Listening on port %d', server.address().port);
});
