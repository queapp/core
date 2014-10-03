var request = require("request");

var thing = function(host, port, id) {

  var root = this;

  // did user give a numerical id
  var structure;
  if (typeof id == "object") {
    request.post(
      {
        url: "http://" + host + ":" + port + "/things/add",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(id)
      }, function(error, response, body) {
        body = JSON.parse(body);
        root.id = body.id;
        console.log(root.id)
      }
    );
  } else {
    structure = {};
    root.id = id;
  }


  // does the specified id exist?
  // request.get(
  //   {
  //     url: "http://" + host + ":" + port + "/things/" + id + "/data",
  //     headers: {
  //       "Content-Type": "application/json"
  //     }
  //   }, function(error, response, body) {
  //     body = JSON.parse(body);
  //     if (body.status == "NOHIT") {
  //       // add the thing
  //       console.log(JSON.stringify(structure || {}))
  //
  //
  //     }
  //   }
  // );


  this.data = {

    push: function(property, val, done) {
      var d = {}
      d[property] = val;

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


}


// t = new thing("127.0.0.1", 8000, 0);
// t.data.push("data", 1235, function() {
//   t.data.pull("data", function(val) {
//     console.log(val)
//   });
// });

t = new thing("127.0.0.1", 8000, 0);
t.data.push("data", 1235, function() {
  t.data.pull("data", function(val) {
    console.log(val)
  });
});
