// thing routes
// manages the thing model

// create instance of thing model
var ThingServer = require("./models/things");
var things = new ThingServer();

// all the routes
module.exports = function(app) {

  // get all things
  app.get("/things/all", function(req, res, next) {
    things.getThings(null, function(data) {
      res.send( {data: data} );
    });
  });

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

  // delete a thing
  app.delete("/things/:id", function(req, res, next) {
    things.deleteThing(parseInt(req.param("id")), function() {
      res.send( things.createResponsePacket() );
    });
  });

};
