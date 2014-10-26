
module.exports = function(app, blocks) {

  app.get("/blocks/all", function(req, res, next) {
    blocks.get(null, function(data) {
      res.status(200);
      res.end(JSON.stringify({data: data}));
    });
  });


  app.post("/blocks/add", function(req, res, next) {
    blocks.add(req.body, function(err) {
      res.send( blocks.createResponsePacket({}) );
    })
  });

  app.delete("/blocks/:id", function(req, res, next) {
    blocks.delete(parseInt(req.param("id")), function(err) {
      res.send( blocks.createResponsePacket() );
    })
  });

  app.get("/blocks/:id/code", function(req, res, next) {
    blocks.get(parseInt(req.param("id")), function(data) {
      res.send( data || blocks.createResponsePacket("NOHIT") );
    });
  });

  app.put("/blocks/:id/code", function(req, res, next) {
    blocks.update(parseInt(req.param("id")), req.body, function() {
      res.send( blocks.createResponsePacket() );
    });
  });

}
