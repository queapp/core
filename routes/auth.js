var hash = require("sha-1");
var uuid = require("uuid").v4;
var async = require("async");
var wildcard = require("wildcard");

var sessionToken = require("../models/sessiontoken");
var User = require("../models/user");

module.exports = function(app) {

  // is a user exist with that session token? If so, then output their details
  app.get("/auth/whoami", function(req, res) {
    sessionToken.findOne({key: req.header("authentication")}, function(err, token) {
      if (err) {
        res.send({error: "Database Error"});
      } else {
        res.send(token || {key: null});
      }
    });
  });

  app.post("/auth", function(req, res) {
    // apply for a session token
    if (req.body) {
      User.findOne({username: req.body.name, hashpass: hash(req.body.pass)}, function(err, user) {
        if (user) {

          // initialize the token's contents
          tokenObj = {
            hostname: req.headers.host,
            key: uuid(),
            permissions: user.permissions,
            username: user.username
          };

          // create new session token!
          token = new sessionToken(tokenObj);
          token.save(function(err) {
            res.send(err && {error: "Couldn't create token."} || tokenObj);
          });
        } else {
          res.send({error: "No matching users."})
        }
      });
    } else {
      res.send({error: "No Credentials"});
    };
  });

  app.delete("/auth", function(req, res) {
    // get rid of auth token
    sessionToken.find({key: req.header("authentication")}, function(err, tokens) {
      if (err) {
        res.send({error: "Database Error"});
      } else {
        async.map(tokens, function(token, callback) {
          token.remove(function(err) { callback(null, err); });
        }, function(err, result) {
          res.send(err && {error: "Couldn't delete key"} || {status: "OK"})
        });
      }
    });
  });

  // does the user have permission to do something?
  app.get("/auth/can/:permission", function(res, req) {
    sessionToken.findOne({key: req.header("authentication")}, function(err, token) {
      // check for matches
      resp = [];
      this.auth.permissions.forEach(function(p) {
        resp.push( matchWildcard(p, permission).length );
      });
      res.send({allowed: _.filter(resp, function(x) { return x !== 0; }).length});
    });
  });

}
