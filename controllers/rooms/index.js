/**
 * Rooms Controller. This module manages all the serverside CRUD operations
 * pertaining to rooms, and the code within them.
 * @module controller/rooms
 */

var fs = require("fs");
var _ = require("underscore");
var path = require("path");
var async = require("async");

var Room = require("../../models/rooms");
var Thing = require("../../models/things");


module.exports = function(thedb) {
  var root = this;

  // currently active auth key
  this.currentAuthKey = null;

  // a default room template; used in .add()
  this.defaultRoom = {
    "name": "Untitled Room",
    "desc": "Untitled Room Description",
    "id": null,
    "image": null,
    "tags": [],
    "things": []
  }

  // the websocket instance
  this.socket = null;

  /**
   * Add a new room to the room collection.
   * @param {object}   data The data to add to the collection
   * @param {Function} done Optional callback. Passes the new room id on success.
   */
  this.add = function(data, done) {
    // update
    this.get(null, function(all) {

      // allocate id
      maxId = _.max(all, function(i) {
        return i.id;
      }).id || 0;

      // add new record
      item = _.extend(root.defaultRoom, data);
      item.id = ++maxId;

      item.type = "room";
      var thing = new Room(item);
      thing.save(function(err, d) {

        // tell the frontend it needs to pull in a new thing
        Room.find({}, function(err, all) {
          root.socket && root.socket.emit("backend-data-change", {
            type: "room",
            data: all
          });
        });

        // callback
        done && done(item.id);
      });
    });
  }

  /**
   * Deletes a room from the room collection.
   * @param  {number}   id   The id of the room to delete.
   * @param  {Function} done Optional callback. Returns any error if one exists.
   */
  this.delete = function(id, done) {
    Room.remove({id: id}, function(err, all) {

      // return if an error has occured
      if (err && done) {
        done(err);
        return;
      }

      // tell the frontend it's time to update
      Room.find({}, function(err, all) {
        root.socket && root.socket.emit("backend-data-change", {
          type: "room",
          data: all
        });
      });

      // callback
      done && done(null);
    });
  }

 /**
  * Get a list of all rooms within the room container
  * @param  {number}   id   The id to search for while retreiving things. null
  *                         will return all things.
  * @param  {Function} done Optional callback - returns any errors that are
  *                         thrown.
  */
  this.get = function(id, done) {

    // get from persistant data store
    Room.find(function(err, docs) {

      // if there was a problem, return an error.
      if (err && done) {
        done(err);
        return;
      }

      // convert all models to objects
      // for encapsulation
      ret = docs.map(function(doc) {
        ob = doc.toObject();
        delete ob._id;
        return ob;
      });

      // search for id
      if (id !== null) {
        ret = _.find(ret, function(i) {
          return i.id == id || undefined;
        });
      }

      // return data
      done(ret);
    });
  };

  /**
   * Update room document with the specified changes.
   * @param  {number}   id      The id of the room to update
   * @param  {object}   changes The changes to make to the room. This doesn't
   *                            have to contain all the data, just the stuff to
   *                            be changed.
   * @param  {Function} done    Optional callback - returns any errors that are
   *                            thrown.
   */
  this.update = function(id, changes, done) {
    Room.update({id: id}, changes, {}, function(err, d) {
      done && done(err || d);
    });
  }

  /**
   * Add a new thing to a room
   * @param {number}   id       The room to add the thing into.
   * @param {number}   tid      The thing's id to add into the room.
   * @param {Function} callback Optional callback - returns any errors that are
   *                            thrown.
   */
  this.addNewThing = function(id, tid, callback) {
    Room.findOne({id: id}, function(err, thng) {

      if (!err && thng) {

        // only add if the array doesn't already contain the thing
        if( thng.things.filter(function(i) {
          return i.id === tid;
        }).length === 0) {
          thng.things.push({id: tid});
        };

        // update the room
        Room.update({id: id}, thng, {}, function(err) {
          callback && callback(err);
        });
      } else {
        callback && callback(err);
      };

    });
  }

  /**
   * Delete's a thing from the specified room
   * @param {number}   id   The id of the room to delete from
   * @param {number}   tid  The thing id to delete from the room. All occurances
   *                        of the thing will be removed.
   * @param {Function} done Optional callback on completion.
   */
  this.deleteThing = function(id, tid, done) {
    Room.findOne({id: id}, function(err, room) {

      // turn the room into an object
      // room = room.toObject();
      delete room._id;

      // remove the thing
      room.things = room.things.filter(function(i) {
        return i.id !== tid;
      });

      // update the room
      Room.update({id: id}, room, {}, function(err) {

        // return if an error has occured
        if (err && done) {
          done(err);
          return;
        }

        // tell the frontend it's time to update
        Room.find({}, function(err, all) {
          root.socket && root.socket.emit("backend-data-change", {
            type: "room",
            data: all
          });
        });

        // callback
        done && done();
      });
    });
  };


  /**
   * Update users that are currently in a room
   * FIXME: Is this really needed when update already exists?
   * @param {number}   id       The id of the room to update the users of
   * @param {object}   users    An array of users to add to the room
   * @param {Function} callback Optional callback - returns any errors that are
   *                            thrown.
   */
  this.updateUsers = function(id, users, callback) {
    Room.update({id: id}, {usersInside: users}, {}, function(err) {
      callback && callback(err);
    });
  };

  /**
   * Update containing things within a room.
   * FIXME: Is this really needed when update already exists?
   * @param {number}   id       The id of the room to update
   * @param {object}   things   An array of things to put into the room.
   * @param {Function} callback Optional callback - returns any errors that are
   *                            thrown.
   */
  this.updateThings = function(id, things, callback) {
    // remove clutter
    things.forEach(function(thing) { delete thing.things; });

    // update the db
    Room.update({id: id}, {things: things}, {}, function(err) {
      callback && callback(err);
    });
  };

  /**
    Create a response packet with the correct status and message
  */
  this.createResponsePacket = function(status, data) {
    return _.extend({"status": status || "OK", "msg": null}, data || {});
  }

}
