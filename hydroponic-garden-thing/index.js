var request = require("request");
var strftime = require("strftime");

var thing = function(host, port, id, structure, callback) {

  var root = this;

  // does the specific id specified exist on the server backend?
  this.doesIdExist = function(id, callback) {
    request.get({
      url: "http://" + host + ":" + port + "/things/" + id + "/data",
      headers: {
        "Content-Type": "application/json"
      }
    }, function(error, response, body) {
      body = JSON.parse(body);
      callback( body.status != "NOHIT" );
    });
  }


  this.data = {

    push: function(property, val, done) {
      var d = {}
      d[property] = {
        value: val
      };

      this.cache = {};

      request.put(
        {
          url: "http://" + host + ":" + port + "/things/" + root.id + "/data",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(d)
        }, function(error, response, body) {
          done && done(body);
        }
      );
    },


    pull: function(property, done) {
      request.get(
        {
          url: "http://" + host + ":" + port + "/things/" + root.id + "/data",
          headers: {
            "Content-Type": "application/json"
          }
        }, function(error, response, body) {
          body = body && JSON.parse(body);
          root.cache = body;
          done && done(body && body[property] || undefined);
        }
      );
    }

  }

  // did user give a numerical id?
  this.doesIdExist(id, function(doesIt) {
    if (doesIt == false || typeof id != "number") {
      request.post(
        {
          url: "http://" + host + ":" + port + "/things/add",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(structure)
        }, function(error, response, body) {
          body = JSON.parse(body);
          root.id = body.id;

          callback(root);
        }
      );
    } else {
      root.id = id;
      callback(root);
    }
  });

}


id = 5;

t = new thing("127.0.0.1", 8000, id, {
// t = new thing("127.0.0.1", 8000, id, {
  name: "Hydroponic Garden",
  desc: "A garden that grows me stuff",
  tags: ["garden", "hydroponics"],
  image: "http://panamashippingcontainerhouse.com/wp-content/uploads/2012/07/Hydroponics-650x487.jpg",
  data: {
    wateringTime: {
      value: "11:00:00"
    },
    wateringDurationMinutes: {
      value: 10
    },
    currentlyWatering: {
      value: false,
      type: "button",
      readonly: true
    },
    turnPumpOn: {
      label: "Run pump through a cycle",
      value: false
    }
  }
}, function(thing) {
  console.log("Thing ID is", thing.id);

  var pump = require("./pump")(thing);

  // the global timer
  var globalTimer = setInterval(function() {
    // test to see if it is time for the pump to turn on
    thing.data.pull("wateringTime", function(when) {
    // console.log(strftime('%T'), when)
      if ( strftime('%T') == when.value ) {
        thing.data.pull("wateringDurationMinutes", function(duration) {
          pump.doCycle(duration.value, when.value);
        });
      }
    });

    // manually do a cycle
    thing.data.pull("turnPumpOn", function(doCycle) {
      if (doCycle.value) {
        thing.data.push("turnPumpOn", false, function() {});

        thing.data.pull("wateringDurationMinutes", function(duration) {
          pump.doCycle(duration.value, null);
        });

      };
    });

  }, 1000);


});
