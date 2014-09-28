var express = require("express");
var bodyParser = require("body-parser");
var thingcontainer = require("./thingcontainer/index");

var app = express();
app.use(bodyParser.json());

var things = new thingcontainer();


// list a specific thing's data
app.get("/things/:id/data", function(req, res, next) {
  things.getThings(parseInt(req.param("id")), function(data) {
    res.send( data.data );
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
