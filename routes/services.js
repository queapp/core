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

  // get things that match a specific tag
  app.get("/services/tag/:tag", function(req, res, next) {
    services.get(null, function(data) {
      res.send({data: _.filter(data, function(item) {
        return _.contains(item.tags, req.param("tag"));
      })});
    });
  });


  // create auth key for adding a new thing
  app.get("/services/genkey", function(req, res, next) {
    res.send(
      services.createResponsePacket(
        "OK", {
          key: services.createNewAuthKey()
        }
      )
    );
  });

  // add a new thing with authentication
  app.post("/services/add/:key", function(req, res, next) {
    services.addWithAuth(req.param("key"), req.body, function(id) {
      if (id) {
        res.send( services.createResponsePacket("OK", {id: id}) );
      } else {
        res.send( services.createResponsePacket("AUTHFAIL") );
      }
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
