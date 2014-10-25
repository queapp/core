
module.exports = function(app, blocks) {

  app.get("/blocks/all", function(res, req) {
    req.send('1');
  });

}
