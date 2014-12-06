// thing routes
// manages the thing model

// create instance of thing model
var _ = require("underscore");

// all the routes
module.exports = function(app, things) {

  // get all things
  app.get("/things/all", function(req, res, next) {
    things.get(null, function(data) {
      res.status(200);
      res.end(JSON.stringify({data: data}));
    });
  });

  // get things that match a specific tag
  app.get("/things/tag/:tag", function(req, res, next) {
    things.get(null, function(data) {
      res.send({data: _.filter(data, function(item) {
        return _.contains(item.tags, req.param("tag"));
      })});
    });
  });

  // create auth key for adding a new thing
  app.get("/things/genkey", function(req, res, next) {
    res.send(
      things.createResponsePacket(
        "OK", {
          key: things.createNewAuthKey()
        }
      )
    );
  });

  // add a new thing with authentication
  app.post("/things/add/:key", function(req, res, next) {
    things.addWithAuth(req.param("key"), req.body, function(id) {
      if (id) {
        res.send( things.createResponsePacket("OK", {id: id}) );
      } else {
        res.send( things.createResponsePacket("AUTHFAIL") );
      }
    });
  });

  app.post("/things/add", function(req, res, next) {
    things.add(req.body, function(id) {
      if (id) {
        res.send( things.createResponsePacket("OK", {id: id}) );
      } else {
        res.send( things.createResponsePacket("AUTHFAIL") );
      }
    });
  });

  // list a specific thing's data
  app.get("/things/:id/data", function(req, res, next) {
    things.get(parseInt(req.param("id")), function(data) {
      res.send( data && data.data || things.createResponsePacket("NOHIT") );
    });
  });

  // list a specific thing's actions
  app.get("/things/:id/actions", function(req, res, next) {
    things.get(parseInt(req.param("id")), function(data) {
      res.send( data && data.actions || things.createResponsePacket("NOHIT") );
    });
  });

  // update thing data over http
  app.put("/things/:id/data", function(req, res, next) {
    things.update(parseInt(req.param("id")), req.body, function() {
      res.send( things.createResponsePacket() );
    });
  });

  // reorder things
  app.get("/things/:id/location/:new", function(req, res, next) {
    things.reorder(parseInt(req.param("id")), parseInt(req.param("new")), function() {
      res.send( things.createResponsePacket() );
    });
  });

  // delete a thing
  app.delete("/things/:id", function(req, res, next) {
    things.delete(parseInt(req.param("id")), function() {
      res.send( things.createResponsePacket() );
    });
  });


};
