/**
 * Authentication Controller. THis module handles user permission checking
 * server-side.
 * @module controller/auth
 */
var _ = require("underscore");
var sessionToken = require("../../models/sessiontoken");
var wildcard = require("wildcard");

var tokenexpiresafter = 60 * 60 * 24; // 1 day

/**
 * Checks if the current user specified has permissions to perform the specified
 * permission
 * @param {Object}   auth       authentication object representing current user
 *                              session
 * @param {String}   permission The permission object to check, in standard Que
 *                              permission form
 * @param {Function} cb         Callback in response, with an error string then
 *                              data if applicable
 * @alias module:controller/auth.can
 */
var canUser = function(auth, permission, cb) {
  sessionToken.findOne({key: auth}, function(err, token) {
    if (err) {
      cb(err);
      return;
    }

    // check for matches
    if (token) {

      // get creation time
      if (token.toObject().createdAt) {
        createdat = new Date(token.toObject().createdAt.toString());

        // check for token expiration
        if ( createdat.getTime() / 1000 + tokenexpiresafter < new Date().getTime() / 1000 ) {
          sessionToken.remove({key: auth}, function(err) {
            cb(err || "Token Expired - Not Authenticated");
          });
        }
      };

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

  can: canUser,

  /**
   * wraps a permission checker into a middleware-compatable format. The user is
   * referenced internally from the user session.
   * @param {string} permission The permission to check against
   */
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
