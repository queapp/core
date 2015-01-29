/**
 * Notify controller. This module manages notification creation, reading, and
 * dismissal (deleting).
 */

var _ = require("underscore");
var Notify = require("../../models/notify");

module.exports = {
  socket: null, // the websocket

  /**
   * Create a new notification to be shown to the user
   * @param {string}   body  The notification textual content
   * @param {string}   title The notification title
   * @param {Function} done  Optional callback function - returns the newly
   *                         created notification's id, or an error.
   */
  createNotify: function(body, title, done) {
    var root = this;

    // get notify collection contents
    Notify.find(function(err, docs) {

      // was there an error?
      if (err && done) done(err);

      // convert the document list into an object list
      ret = _.map(docs, function(doc) {
        // convert to object from model
        // for encapsulation
        ob = doc.toObject();
        delete ob._id;

        return ob;
      });

      // get max id
      // TODO: Implementation is a bit flawed.
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
        root.socket && root.socket.emit("backend-data-change", {
          type: "notify",
          data: docs
        });

        // callback
        done && done(item.id);
      });

    });
  },

  /**
   * dismiss (delete) a notification from the collection
   * @param {number}   id   Notification id to dismiss
   * @param {Function} done Optional callback - returns an error if applicable.
   */
  dismissNotify: function(id, done) {
    Notify.remove({id: id}, function(err) {
      done && done(err);
    });
  },

  /**
   * Gets all active notifications from the collection.
   * @param  {Function} done Callback - returns an error as the first argument,
   *                         and the object list second.
   */
  get: function(done) {
    Notify.find(function(err, docs) {

      // was there an error?
      if (err) done(err);

      // convert the document list into an object list
      // and return it through the callback
      done(
        null,
        _.map(docs, function(doc) {
          // convert to object from model
          // for encapsulation
          ob = doc.toObject();
          delete ob._id;

          return ob;
        })
      );

    });
  },

  createResponsePacket: function(status, data) {
    return _.extend({"status": status || "OK", "msg": null}, data || {});
  }


}
