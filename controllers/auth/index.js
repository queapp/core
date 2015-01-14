var _ = require("underscore");
var sessionToken = require("../../models/sessiontoken");
var wildcard = require("wildcard");

var tokenexpiresafter = 60 * 60 * 24; // 1 day

var canUser = function(auth, permission, cb) {
  sessionToken.findOne({key: auth}, function(err, token) {
    if (err) {
      cb(err);
      return;
    }

    // check for matches
    if (token) {

      // get creation time
      createdat = new Date(token.toObject().createdAt.toString());

      // check for token expiration
      if ( createdat.getTime() / 1000 + tokenexpiresafter < new Date().getTime() / 1000 ) {
        sessionToken.remove({key: auth}, function(err) {
          cb(err || "Token Expired - Not Authenticated");
        });
      }

      resp = [];
      _.each(token.permissions, function(p) {
        resp.push( wildcard(p, permission) );
      });
      cb(null, !!_.filter(resp, function(x) {
        return x.length !== undefined;
      }).length);
    } else {
      cb("Not Authenticated");
    }
  });
};

module.exports = {

  // check if a user has permission to do an action
  can: canUser,

  // wraps the above permission-checking .can() function
  // into a middleware-compatable version.
  canMiddleware: function(permission) {
    var root = this;
    return function(req, res, next) {
      permission = permission.replace("#id", req.param("id"));
      canUser(req.header("authentication"), permission, function(err, allowed) {
        if (err) {
          next(err);
        } else if (!allowed) {
          next("Permission Denied.");
        } else next();
      });
    }
  }


}
