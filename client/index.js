var request = require("request");
// var gpio = require("pi-gpio");
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

// t = new thing("que-app-backend.herokuapp.com", 80, id, {
t = new thing("127.0.0.1", 8000, id, {
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

  // pump object
  var pump = {

    // is pump on?
    pumpOn: false,

    // turn on the pump
    turnOn: function(callback) {
      var that = this;
      // gpio.open(config.gpiopump, "output", function(err) {
      //   gpio.write(config.gpiopump, 1, function() {
      //     gpio.close(config.gpiopump);
          that.pumpOn = true;
      //   });
      // });
      console.log("DO CYCLE:", true);
    },

    // turn off the pump
    turnOff: function() {
      var that = this;
      // gpio.open(config.gpiopump, "output", function(err) {
      //   gpio.write(config.gpiopump, 0, function() {
      //     gpio.close(config.gpiopump);
          that.pumpOn = false;
      //   });
      // });
      console.log("DO CYCLE:", false);
    },


    // run the pump cycle
    doCycle: function(duration, when) {
      if (this.pumpOn) return false
      // turn on pump
      pump.turnOn();
      console.log("Pump is on. Will turn off in", duration, "minutes.");
      var countDown = duration * 60;

      // count down
      counter = function() {
        thing.data.push("currentlyWatering", countDown, function(){});
        countDown--;
        if (countDown > 0) {
          setTimeout(counter, 1000);
        } else {
          // turn off the pump after the cycle is complete
          pump.turnOff();
          when && console.log("Pump is now off. Next automatic cycle at", when, "tommorrow.") || console.log("Pump is now off.");
          thing.data.push("currentlyWatering", false, function(){});
        }
      }
      setTimeout(counter, 1000);
    }
  }

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
