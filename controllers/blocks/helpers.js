/**
 * Block Helpers. This module is injected into each running block and serves as
 * its api to Que's functions.
 * @module controller/blocks/helpers
 */

var _ = require("underscore");
var request = require("request");

// some small helper apis to make outside interaction
// possible inside of a code block
module.exports = function(socket, things, services, notifys, rooms, item, persist) {

  return {

    /**
     * Iterates over a thing container searching for the specified tag.
     * @param {string}   tag The tag to search with
     * @param {Function} cb  This callback is called once for each thing
     *                       iteration, passing the thing first and the
     *                       iteration count second
     */
    getThingByTag: function(tag, cb) {
      things.get(null, function(data) {

        // get all things with the specified tag
        fltr = _.filter(data, function(item) {
          return _.contains(item.tags, tag);
        });

        // iterate over each thing
        fltr.forEach(function(f, ct) {
          cb(f, ct);
        });
      });
    },

    /**
     * Iterates over a thing container searching for the specified id. (Well,
     * this should only 'iterate' once)
     * @param {string}   id The id to search for
     * @param {Function} cb  This callback is called once for each thing
     *                       iteration, passing the thing first and the
     *                       iteration count second
     */
    getThingById: function(id, cb) {
      things.get(null, function(data) {

        // get all things with the specified id
        fltr = _.filter(data, function(item) {
          return item.id == id;
        });

        // iterate over each thing
        fltr.forEach(function(f, ct) {
          cb(f, ct);
        });
      });
    },

    /**
     * Iterates over a room container searching for the specified tag.
     * @param {string}   tag The tag to search with
     * @param {Function} cb  This callback is called once for each room
     *                       iteration, passing the room first and the
     *                       iteration count second
     */
    getRoomByTag: function(tag, cb) {
      rooms.get(null, function(data) {

        // get matching rooms
        fltr = _.filter(data, function(item) {
          return _.contains(item.tags, tag);
        });

        // call the callback for each one
        _.each(fltr, function(f, ct) {
          cb(f, ct);
        });
      });
    },

    /**
     * Iterates over a room container searching for the specified id. (Well,
     * this should only 'iterate' once)
     * @param {string}   id The id to search for
     * @param {Function} cb  This callback is called once for each room
     *                       iteration, passing the room first and the
     *                       iteration count second
     */
    getRoomById: function(id, cb) {
      rooms.get(null, function(data) {

        // get matching rooms
        fltr = _.filter(data, function(item) {
          return item.id == id;
        });

        // call the callback for each one
        _.each(fltr, function(f, ct) {
          cb(f, ct);
        });
      });
    },


    /**
     * Sets a control's value within a thing.
     * @param {number}   id       The id of the thing to modify
     * @param {string}   key      The internal control name that should be
     *                            modified. This can be found by looking at the
     *                            placeholder text of textbox-based controls or
     *                            by hovering your mouse over the control name
     *                            in the the things view.
     * @param {string|number|boolean}   value    The value to assign the the
     *                                           specified key name. If a boolean
     *                                           is passed the control will take
     *                                           the form of a button. Any other
     *                                           type will take the form of a
     *                                           textbox.
     * @param {Function} callback Callback that returns a boolean success flag.
     */
    setThingValue: function(id, key, value, callback) {
      // set up the object
      obj = {}
      obj[key] = {value: value};

      // update
      things.get(id, function(thing) {
        if (thing.data[key].value !== value) {
          things.update(id, obj, function(data) {
            callback && (data && callback(true) || callback(null));
          });
        }
      });
    },

    button: {

      // a button debouncer
      // basically, if the value changes,
      // we'll know about it.
      debounce: function(id, value, callback) {
        if (persist.button_debounce) {
          if (persist.button_debounce[id] !== value) {
            callback(value);
          }
        } else {
          persist.button_debounce = {};
        }

        // set the current state
        persist.button_debounce[id] = value;
      }
    },


    // get and set persistant variables intividual to that block
    get: function(elem) {
      return persist[elem];
    },

    set: function(elem, value) {
      if (!persist) persist = []
      persist[elem] = value;
      return true;
    },




    /**
     * Returns a convience object containing easy-to-call versions of each
     * action's trigger and detriggr methods.
     * @param {object} thing The thing to extract the actions from.
     */
    getActions: function(thing) {
      actions = {}
      // format
      thing.actions.forEach(function(action) {
        actions[action.name] = {
          trigger: function(cb) {
            // console.log("TRIGGER", JSON.stringify(action));
            request(action.trigger, function(err, resp, body) {
              try {
                cb && cb(err, resp, JSON.parse(body));
              } catch (err) {}
            });
          },
          detrigger: function(cb) {
            // console.log("DETRIGGER", JSON.stringify(action));
            request(action.detrigger, function(err, resp, body) {
              try {
                cb && cb(err, resp, JSON.parse(body));
              } catch (err) {}
            });
          }
        }
      });

      return actions;
    },



    /**
     * Indicate that a user has entered or left a room.
     * @param  {object}   room     The room in which to do the operation.
     * @param  {string|boolean}   action   The action to take - if equal to
     *                                     'enter', 'e', or a truthy value, the
     *                                     user should enter the room, anything
     *                                     else means to leave the room.
     * @param  {string}   username The username to enter/leave the room.
     * @param  {Function} callback Optional callback on operation completion.
     */
    room: function(room, action, username, callback) {

      // add or remove username
      if (action || action === "enter" || action === "e") {
        // add, but make sure user isn't already in the list
        if (room.usersInside.indexOf(username) === -1)
          room.usersInside.push(username);
      } else {
        // remove
        room.usersInside.splice(
          room.usersInside.indexOf(username),
          1
        );
      }

      // update backend
      rooms.updateUsers(room.id, room.usersInside, function() {

        // update frontend
        rooms.get(null, function(all) {
          socket.emit('backend-data-change', {
            type: "room",
            data: all
          });
        });

        // callback
        callback && callback();
      });
    },


    /**
     * Log to the block console.
     * @param  {*} msg Data to log
     */
    log: function(msg) {
      socket && socket.emit("block-log", {
        id: item.id,
        type: "info",
        when: new Date(),
        msg: JSON.stringify(msg)
      });
    },

    /**
     * Log to the block console, but with a warning log level.
     * @param  {*} msg Data to log
     */
    warn: function(msg) {
      socket && socket.emit("block-log", {
        id: item.id,
        type: "warn",
        when: new Date(),
        msg: msg.toString()
      });
    },

    /**
     * Log to the block console, but with an error log level.
     * @param  {*} msg Data to log
     */
    error: function(msg) {
      socket && socket.emit("block-log", {
        id: item.id,
        type: "error",
        when: new Date(),
        msg: msg.toString()
      });
    },

    /**
     * send a notification to the user, which is displayed onto the Dashboard
     * page
     * @param  {string} msg   The body of the notification
     * @param  {string} title The notification title
     */
    notify: function(msg, title) {
      notifys.createNotify(msg, title);
    },

    /**
     * Check to see if the time specified is the current time.
     * @param {number}   h        Hours of the time.
     * @param {number}   m        Minutes of the time.
     * @param {number}   s        Seconds of the time.
     * @param {Function} callback Callback when the time matches what has been
     *                            indicated.
     */
    whenTime: function(h, m, s, callback) {
      d = new Date();
      if (d.getHours() == h && d.getMinutes() == m && d.getSeconds() == s) {
        callback();
      }
    },

    /**
     * canvas drawing functions
     * @param {number} id  Thing id to draw to
     * @param {string} key The control name within the thing with the canvas to
     *                     be updated.
     */
    getCanvas: function(id, key) {
      if (!socket) return null


      return {

        clear: function(x, y, w, h) {
          socket.emit("canvas-update", {
            id: id, key: key,
            action: "clear",
            x: x, y: y, w: w, h: h
          });
        },

        line: function(nodes, fill, stroke, fillorstroke) {
          socket.emit("canvas-update", {
            id: id, key: key,
            action: "line",
            nodes: nodes,
            fillColor: fill,
            strokeColor: stroke,
            finished: fillorstroke
          });
        },

        rect: function(x, y, w, h, fill, stroke) {
          socket.emit("canvas-update", {
            id: id, key: key,
            action: "rect",
            x: x, y: y, w: w, h: h,
            fillColor: fill,
            strokeColor: stroke
          });
        },

        imageFromUrl: function(url, x, y) {
          socket.emit("canvas-update", {
            id: id, key: key,
            action: "image",
            src: url,
            x: x, y: y
          });
        },

        text: function(text, x, y) {
          socket.emit("canvas-update", {
            id: id, key: key,
            action: "text",
            text: text,
            x: x, y: y,
            fillColor: fill,
            strokeColor: stroke
          });
        }
      }


    },

    /**
     * Abstrated underscore.js utility functions
     * @type {object}
     */
    underscore: _


  };
};
