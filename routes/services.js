// thing routes
// manages the thing model

// create instance of thing model
// var ThingServer = require("./models/things");
// var ServiceConverter = require("./models/services");
//
// // convert thing model to service model
// var services = ServiceConverter(new ThingServer());

var ServiceServer = require("./models/services");

// convert thing model to service model
var services = new ServiceServer();

// all the routes
module.exports = function(app) {

  // get all things
  app.get("/services/all", function(req, res, next) {
    services.get(null, function(data) {
      res.send( {data: data} );
    });
  });

  // add a new thing
  app.post("/services/add", function(req, res, next) {
    services.add(req.body, function(id) {
      res.send( services.createResponsePacket("OK", {id: id}) );
    });
  });

  // list a specific thing's data
  app.get("/services/:id/data", function(req, res, next) {
    services.get(parseInt(req.param("id")), function(data) {
      res.send( data && data.data || services.createResponsePacket("NOHIT") );
    });
  });

  // update thing data
  app.put("/services/:id/data", function(req, res, next) {
    services.update(parseInt(req.param("id")), req.body, function() {
      res.send( services.createResponsePacket() );
    });
  });

  // reorder things
  app.get("/services/:id/location/:new", function(req, res, next) {
    services.reorder(parseInt(req.param("id")), parseInt(req.param("new")), function() {
      res.send( services.createResponsePacket() );
    });
  });

  // delete a thing
  app.delete("/services/:id", function(req, res, next) {
    services.delete(parseInt(req.param("id")), function() {
      res.send( services.createResponsePacket() );
    });
  });

};
