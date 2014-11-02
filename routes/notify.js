
module.exports = function(app, notify) {

  // get all notifys
  app.get("/notify/all", function(req, res, next) {
    notify.get(function(er, data) {
      res.status(200);
      res.end(JSON.stringify({data: data}));
    });
  });

  // add a notify
  app.post("/notify/add", function(req, res, next) {
    notify.createNotify(req.body.body, req.body.title, function(id) {
      res.send( notify.createResponsePacket({id: id}) );
    })
  });

  // delete a notify
  app.delete("/notify/:id", function(req, res, next) {
    notify.dismissNotify(parseInt(req.param("id")), function(err) {
      res.send( notify.createResponsePacket() );
    })
  });

}
