var request = require("request");

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
  name: "Hydroponic Garden",
  desc: "A garden that grows me stuff",
  tags: ["garden", "hydroponics"]
}, function(thing) {
  console.log("Thing ID is", thing.id);

  // sample data operation
  thing.data.push("data", 10000, function() {
    thing.data.pull("data", function(val) {
      console.log(val)
    });
  });


});
