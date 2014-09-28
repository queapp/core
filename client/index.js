var request = require("request");

var thing = function(host, port, id) {

  var root = this;

  this.data = {

    push: function(property, val, done) {
      var d = {}
      d[property] = val;

      this.cache = {};

      request.put(
        {
          url: "http://" + host + ":" + port + "/things/" + id + "/data",
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
          url: "http://" + host + ":" + port + "/things/" + id + "/data",
          headers: {
            "Content-Type": "application/json"
          }
        }, function(error, response, body) {
          body = JSON.parse(body);
          root.cache = body;
          done && done(body[property]);
        }
      );
    }

  }


}


t = new thing("127.0.0.1", 8000, 0);
t.data.push("data", 1235, function() {
  t.data.pull("data", function(val) {
    console.log(val)
  });
});
