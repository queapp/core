var bunyan = require("bunyan");
var path = require("path");
var mkdirp = require('mkdirp');


module.exports = function(logFolder) {

  mkdirp(path.join(__dirname, logFolder || "logs"), function(err) {

    // create logger
    var logger = bunyan.createLogger({
      name: 'foo',
      streams: [{
          type: 'rotating-file',
          path: path.join(logFolder || "logs", 'que.log'),
          period: '1d',   // daily rotation
          count: 3        // keep 3 back copies
      }]
    });

    // create console.log clone
    var log = console.log;

    // create a function out
    // doesn't log to the file, only to stdout
    console.out = function() {
      var args = Array.prototype.slice.call(arguments);
      log.apply(this, args);
    }

    // new console.log
    console.log = function () {
      var args = Array.prototype.slice.call(arguments);
      logger.info(args.join(" "));
      log.apply(this, args);
    };

    // new console.error
    var error = console.error;
    console.error = function () {
      var args = Array.prototype.slice.call(arguments);
      logger.info.call(args);
      error.apply(this, args);
    };

  });

}
