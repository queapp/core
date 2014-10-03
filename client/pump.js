// var gpio = require("pi-gpio");

// pump object
module.exports = function(thing) {
  return {

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
      var that = this;
      if (this.pumpOn) return false
      // turn on pump
      this.turnOn();
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
          that.turnOff();
          when && console.log("Pump is now off. Next automatic cycle at", when, "tommorrow.") || console.log("Pump is now off.");
          thing.data.push("currentlyWatering", false, function(){});
        }
      }
      setTimeout(counter, 1000);
    }
  }
}
