var _ = require("underscore");
var request = require("request");

// some small helper apis to make outside interaction
// possible inside of a code block
module.exports = function(socket, things, services, notifys, item) {

  return {

    // get a thing by its tag
    getThingByTag: function(tag, cb) {
      things.get(null, function(data) {

        // get matching things
        fltr = _.filter(data, function(item) {
          return _.contains(item.tags, tag);
        });

        // iterate over them
        _.each(fltr, function(f, ct) {
          cb(f, ct);
        });
      });
    },

    // set value for things
    setThingValue: function(id, key, value, callback) {
      // set up the object
      obj = {}
      obj[key] = {value: value};

      // update
      things.update(id, obj, function(data) {
        callback && (data && callback(true) || callback(null));
      });
    },




    // get and set persistant variables intividual to that block
    get: function(elem) {
      return item.data[elem];
    },

    set: function(elem, value) {
      if (!item.data) item.data = []
      item.data[elem] = value;
      return true;
    },


    getActions: function(thing) {
      actions = {}
      // format
      thing.actions.forEach(function(action) {
        actions[action.name] = {
          trigger: function(cb) {
            request(action.trigger, function(err, resp, body) {
              cb && cb(err, resp, body);
            });
          },
          detrigger: function(cb) {
            request(action.detrigger, function(err, resp, body) {
              cb && cb(err, resp, body);
            });
          }
        }
      });

      return actions;
    },




    // log to console underneath the block
    log: function(msg) {
      socket && socket.emit("block-log", {
        id: item.id,
        type: "info",
        msg: msg && msg.toString() || msg
      });
    },

    // send a notification to the user
    notify: function(msg, title) {
      notifys.createNotify(msg, title);
    },

    // if the time is what has been specified
    whenTime: function(h, m, s, callback) {
      d = new Date();
      if (d.getHours() == h && d.getMinutes() == m && d.getSeconds() == s) {
        callback();
      }
    },

    // canvas drawing functions
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

    // all underscore functions
    underscore: _


  };
};
