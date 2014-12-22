var async = require("async");
var _ = require("underscore");

// the model
var User = require("../../models/user");

module.exports = function() {
  var root = this;

  this.socket = null;

  /**
    Add a new thing to the list of things
  */
  this.add = function(data, done) {

    // username cannot have spaces
    if (data.username.split(" ").length > 1)
      done("No spaces can be in a valid username!")


    // save block
    var user = new User(data);
    user.save(function(err, d) {
      // callback
      done && done(null, d);
    });

  }

  /**
    Delete a thing from the list of things
  */
  this.delete = function(username, done) {
    // remove the block
    User.remove({username: username}, function(err, docs) {
      done && done(err);
    });
  }

  /**
    Get a list of all things connected to the container
  */
  this.get = function(username, done) {

    // get from persistant data store
    User.find(function(err, docs) {
      ret = [];
      _.each(docs, function(doc) {

        // convert to object from model
        ob = doc.toObject();
        delete ob._id;

        // add to array
        ret.push(ob);
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
    Replace modified records in one specific thing
  */
  this.update = function(username, changes, done) {
    // update block
    User.update({username: username}, changes, {}, function(err, d) {
      console.log(username, err, changes)
      // callback
      done && done(d);
    });
  };

  /**
    Create a response packet with the correct status and message
  */
  this.createResponsePacket = function(status, data) {
    return _.extend({"status": status || "OK", "msg": null}, data || {});
  }

};
