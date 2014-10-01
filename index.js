var express = require("express");
var cors = require('cors');

var bodyParser = require("body-parser");
var ThingServer = require("./thingcontainer");

var app = express();
app.use(bodyParser.json());

var things = new ThingServer();

// cors
app.use(cors());

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


// run server
var server = app.listen(process.env.PORT || 8000, function() {
  console.log('Listening on port %d', server.address().port);
});
