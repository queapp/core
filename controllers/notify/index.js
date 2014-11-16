var db = require("../persistant/provider");
var _ = require("underscore");

module.exports = {
  socket: null, // the websocket


  createNotify: function(body, title, done) {
    var root = this;

    db.findAllNotifys(function(err, all) {

      // get max id
      maxId = _.max(all, function(i) {
        return i.id;
      }).id || 0;

      // initalize the new notify
      item = {
        "id": ++maxId,
        "title": title,
        "body": body,
        "icon": null
      };

      db.addNotify(item, function(err, d) {
        // tell the frontend it needs to pull in a new notify
        root.socket && root.socket.emit("backend-data-change", "notify");

        // callback
        done && done(item.id);
      });

    });
  },

  // dismiss (delete) a notify
  dismissNotify: function(id, done) {
    db.deleteNotify(id, function(err) {
      done && done(err);
    });
  },

  get: function(done) {
    db.findAllNotifys(done);
  },

  createResponsePacket: function(status, data) {
    return _.extend({"status": status || "OK", "msg": null}, data || {});
  }


}
