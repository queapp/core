var db = require("../persistant/provider");
var _ = require("underscore");

var Notify = require("../../models/notify");

module.exports = {
  socket: null, // the websocket


  createNotify: function(body, title, done) {
    var root = this;

    Notify.find(function(err, docs) {
      ret = [];
      _.each(docs, function(doc) {

        // convert to object from model
        ob = doc.toObject();
        delete ob._id;

        // add to array
        ret.push(ob);
      });

      // get max id
      maxId = _.max(ret, function(i) {
        return i.id;
      }).id || 0;

      // initalize the new notify
      item = {
        "id": ++maxId,
        "title": title,
        "body": body,
        "icon": null
      };

      // add notify
      var notify = new Notify(item);
      notify.save(function(err, d) {
        // tell the frontend it needs to pull in a new notify
        root.socket && root.socket.emit("backend-data-change", "notify");

        // callback
        done && done(item.id);
      });

    });
  },

  // dismiss (delete) a notify
  dismissNotify: function(id, done) {
    Notify.remove({id: id}, function(err) {
      done && done(err);
    });
  },

  get: function(done) {
    Notify.find(function(err, docs) {
      ret = [];
      _.each(docs, function(doc) {

        // convert to object from model
        ob = doc.toObject();
        delete ob._id;

        // add to array
        ret.push(ob);
      });

      done(err, ret);
    });
  },

  createResponsePacket: function(status, data) {
    return _.extend({"status": status || "OK", "msg": null}, data || {});
  }


}
