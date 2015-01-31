/**
 * Users Controller. This module manages all the serverside CRUD operations
 * pertaining to users, and the code within them.
 * @module controller/users
 */

var async = require("async");
var _ = require("underscore");
var hash = require("sha-1");

// the model
var User = require("../../models/user");

module.exports = function() {
  var root = this;

  this.socket = null;

  /**
   * Add a new user to the user collection.
   * @param {object}   data The data to add to the collection
   * @param {Function} done Optional callback. Passes the new user id on success.
   */
  this.add = function(data, done) {

    // username cannot have spaces
    if (data.username.split(" ").length > 1)
      done("No spaces can be in a valid username!")

    // if the password hasn't been hashed already, do that now.
    if (!data.hashpass)
      data.hashpass = hash(data.pass);

    // add permissions if they aren't there
    if (!data.permissions)
      data.permissions = [];

    // save block
    var user = new User(data);
    user.save(function(err, d) {
      // callback
      done && done(null, d);
    });

  }

  /**
   * Deletes a user from the user collection.
   * @param  {number}   username   The username of the user to delete.
   * @param  {Function} done Optional callback. Returns any error if one exists.
   */
  this.delete = function(username, done) {
    // remove the block
    User.remove({username: username}, function(err, docs) {
      done && done(err);
    });
  }


  /**
   * Get a list of all users within the user container
   * @param  {number}   username   The username to search for while retreiving
   *                               a user. A null value will return all users.
   * @param  {Function} done Optional callback - returns any errors that are
   *                         thrown.
   */
  this.get = function(username, done) {

    // get from persistant data store
    User.find(function(err, docs) {

      // convert all models to objects
      // for encapsulation
      ret = docs.map(function(doc) {
        ob = doc.toObject();
        delete ob._id;
        return ob;
      });

      // search for username
      if (username !== null) {
        ret = _.find(ret, function(i) {
          return i.username == username || undefined;
        });
      }

      done(ret);
    });
  };

  /**
   * Update user document with the specified changes.
   * @param  {object}   username      The username of the user to update
   * @param  {object}   changes The changes to make to the user. This doesn't
   *                            have to contain all the data, just the stuff to
   *                            be changed.
   * @param  {Function} done    Optional callback - returns any errors that are
   *                            thrown.
   */
  this.update = function(username, changes, done) {
    // update block
    User.update({username: username}, changes, {}, function(err, d) {
      // callback
      done && done(err || d);
    });
  };

  /**
    Create a response packet with the correct status and message
  */
  this.createResponsePacket = function(status, data) {
    return _.extend({"status": status || "OK", "msg": null}, data || {});
  }

};
