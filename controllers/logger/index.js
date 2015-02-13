/**
 * Logging Controller. This module manages the logging formatting and the
 * logging to file and stdout/stderr.
 * @module controller/logger
 */

var winston = require("winston");
var path = require("path");
var mkdirp = require('mkdirp');
var _ = require("underscore");

module.exports = function(argv, callback) {

  // make the logger directory if it doesn't exist
  mkdirp(process.env.LOGTO || argv.logto || "logs", function(err) {

    // return with error if one exists
    if (err) callback(err);

    // create logger
    var logger = new winston.Logger({
      transports: [
          new winston.transports.File({
              level: 'info',
              filename: path.join(process.env.LOGTO || argv.logto || "logs", "que.log"),
              handleExceptions: true,
              json: true,
              maxsize: 5242880, // 5MB
              maxFiles: 5,
              colorize: false
          }),
          new winston.transports.Console({
              level: 'debug',
              handleExceptions: true,
              json: false,
              colorize: true
          })
      ],
      exitOnError: false
    });

    // set minimum log level
    // logger.transports.console.level = 'verbose';


    // new console.log
    console.log = function() {

      // iterate through the arguments, JSON.stringifying the
      // necessary types for better formatting
      args = _.map(arguments, function(arg) {
        if (typeof arg === "object") {
          return JSON.stringify(arg);
        } else return arg;
      });

      // call the logger
      logger.info.apply(logger, args)
    };

    // callback with logger object
    callback && callback(logger);
  });

}
