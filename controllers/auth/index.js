var _ = require("underscore");
var sessionToken = require("../../models/sessiontoken");
var wildcard = require("wildcard");

module.exports = {

  // check if a user has permission to do an action
  can: function(req, permission, cb) {
    sessionToken.findOne({key: req.header("authentication")}, function(err, token) {
      if (err) {
        cb(err);
        return;
      }
      // check for matches
      resp = [];
      _.each(token.permissions.split(","), function(p) {
        resp.push( wildcard(p, permission) );
      });
      cb(null, !!_.filter(resp, function(x) {
        return x.length !== undefined;
      }).length);
    });
  }
}
