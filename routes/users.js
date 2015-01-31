var userCan = require("../controllers/auth").canMiddleware;

module.exports = function(app, users, sessiontokens, argv) {

  // is `TREATASNEW` set?
  if (process.argv.TREATASNEW || argv.treatasnew) {
    // lets delete all sessions and act as if there are no users
    console.log("Deleting all users...");
    users.delete(null, function(err) {
      if (!err) {
        console.log("Users have all been deleted.");
      } else {
        console.log("Users couldn't be deleted:", err);
      }
    });
  };

  // is this a new que instance (with zero users?), or are we
  // pretending such is true?
  app.get("/users/any", function(req, res) {
    users.get(null, function(data) {
      res.status(200);
      res.end(JSON.stringify({
        newInstance: !data.length
      }));
    });
  });

  // add superuser
  app.post("/users/addsuperuser", function(req, res, next) {

    // is there users?
    users.get(null, function(data) {
      if (!data.length && req.body.pass) {
        // add user
        users.add({
          username: "superadmin",
          pass: req.body.pass,
          permissions: ["*"]
        }, function(err, d) {
          err &&
            res.send( users.createResponsePacket({error: err}) ) ||
            res.send( users.createResponsePacket() );
        });
      } else {
        res.send("Permission Denied.");
      };
    });
  });

  // get all users
  app.get("/users/all", userCan("user.view.all"), function(req, res, next) {
    users.get(null, function(data) {
      res.status(200);
      res.end(JSON.stringify({data: data}));
    });
  });

  // add a user
  app.post("/users/add", userCan("user.create"), function(req, res, next) {
    users.add(req.body, function(err, d) {
      err &&
        res.send( users.createResponsePacket({error: err}) ) ||
        res.send( users.createResponsePacket() );
    });
  });

  // delete a user
  app.delete("/users/:id", userCan("user.delete.#id"), function(req, res, next) {
    users.delete(req.param("id"), function(err) {
      res.send( users.createResponsePacket() );
    });
  });

  // modify / change user's code
  app.put("/users/:id", userCan("user.edit.#id"), function(req, res, next) {
    users.update(req.param("id"), req.body, function() {
      res.send( users.createResponsePacket() );
    });
  });

}
