// thing routes
// manages the thing model

// create instance of thing model
// var ThingServer = require("./models/things");
// var ServiceConverter = require("./models/rooms");
//
// // convert thing model to room model
// var rooms = ServiceConverter(new ThingServer());
var userCan = require("../controllers/auth").canMiddleware;

// all the routes
module.exports = function(app, rooms) {

  // get all things
  app.get("/rooms/all", userCan("room.view.all"), function(req, res, next) {
    rooms.get(null, function(data) {
      res.status(200);
      res.end(JSON.stringify({data: data}));
    });
  });

  // get things that match a specific tag
  app.get("/rooms/tag/:tag", userCan("room.view.all"), function(req, res, next) {
    rooms.get(null, function(data) {
      res.send({data: _.filter(data, function(item) {
        return _.contains(item.tags, req.param("tag"));
      })});
    });
  });

  // add a new thing with authentication
  app.post("/rooms/add", userCan("room.create"), function(req, res, next) {
    rooms.add(req.body, function(id) {
      if (id) {
        res.send( rooms.createResponsePacket("OK", {id: id}) );
      } else {
        res.send( rooms.createResponsePacket("AUTHFAIL") );
      }
    });
  });

  // add a new thing with authentication
  app.post("/rooms/:id/addthing", userCan("room.addthings"), function(req, res, next) {
    rooms.addNewThing(parseInt(req.param("id")), req.body.id, function(id) {
      if (id) {
        res.send( rooms.createResponsePacket("OK", {id: id}) );
      } else {
        res.send( rooms.createResponsePacket("AUTHFAIL") );
      }
    });
  });

  // list a specific thing's data
  app.get("/rooms/:id/data", userCan("room.view.#id"), function(req, res, next) {
    rooms.get(parseInt(req.param("id")), function(data) {
      res.send( data && data.data || rooms.createResponsePacket("NOHIT") );
    });
  });

  // update thing data
  app.put("/rooms/:id/data", userCan("room.edit.#id"), function(req, res, next) {
    rooms.update(parseInt(req.param("id")), req.body, function() {
      res.send( rooms.createResponsePacket() );
    });
  });

  // reorder things
  app.get("/rooms/:id/location/:new", function(req, res, next) {
    rooms.reorder(parseInt(req.param("id")), parseInt(req.param("new")), function() {
      res.send( rooms.createResponsePacket() );
    });
  });

  // delete a thing
  app.delete("/rooms/:id", userCan("room.delete.#id"), function(req, res, next) {
    rooms.delete(parseInt(req.param("id")), function() {
      res.send( rooms.createResponsePacket() );
    });
  });

  // delete a thing
  app.delete("/rooms/:id/:tid", userCan("room.deletething.#id"), function(req, res, next) {
    rooms.deleteThing(parseInt(req.param("id")), parseInt(req.param("tid")), function() {
      res.send( rooms.createResponsePacket() );
    });
  });

};
