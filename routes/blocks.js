
module.exports = function(app, blocks) {

  // get all blocks
  app.get("/blocks/all", function(req, res, next) {
    blocks.get(null, function(data) {
      res.status(200);
      res.end(JSON.stringify({data: data}));
    });
  });

  // add a block
  app.post("/blocks/add", function(req, res, next) {
    blocks.add(req.body, function(err) {
      res.send( blocks.createResponsePacket({}) );
    })
  });

  // delete a block
  app.delete("/blocks/:id", function(req, res, next) {
    blocks.delete(parseInt(req.param("id")), function(err) {
      res.send( blocks.createResponsePacket() );
    })
  });

  // get block's code
  app.get("/blocks/:id/code", function(req, res, next) {
    blocks.get(parseInt(req.param("id")), function(data) {
      res.send( data || blocks.createResponsePacket("NOHIT") );
    });
  });

  // modify / change block's code
  app.put("/blocks/:id/code", function(req, res, next) {
    blocks.update(parseInt(req.param("id")), req.body, function() {
      res.send( blocks.createResponsePacket() );
    });
  });

}
