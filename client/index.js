// iot-thing example code
// by Ryan Gaus (1egoman)
// published under the MIT License
// you must host a iot-server locally on port :8000 for this to work


// the library
var thing = require("iot-thing");

// this is your app's id, set it to null and one will be auto-assigned to you
// the id is available below as thing.id, so store it somewhere for next time and pass it in here
id = 6

// create the thing
// specify the hostname and port of the server, the id, and
// the structure object. This contains all the default settings for the thing.
new thing("que-app-backend.herokuapp.com", 80, id, {
  name: "Example Thing",
  desc: "Prooves that stuff works",
  data: {
    message: {
      value: "Hello World"
    },
    showMessage: {
      value: false,
      label: "Show message in terminal"
    }
  }
}, function(thing) {
  // get the thing id, and print it out
  // console.log("Thing ID is", thing.id);

  // did the user set showMessage to true?
  thing.data.pull("showMessage", function(val) {
    if (val.value == true) {
      // set it to false
      thing.data.push("showMessage", false);

      // show the message in the console
      thing.data.pull("message", function(val) {
        console.log("Output:", val.value);
      });
    }
  });


});
