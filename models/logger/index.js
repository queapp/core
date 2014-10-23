var winston = require("winston");
var path = require("path");
var mkdirp = require('mkdirp');


module.exports = function(argv, callback) {

  // make the logger directory if it doesn't exist
  mkdirp(process.env.LOGTO || argv.logto || "logs", function(err) {

    // create logger
    var logger = new winston.Logger({
      transports: [
          new winston.transports.File({
              level: 'info',
              filename: path.join(process.env.LOGTO || argv.logto || "logs", "que.log"),
              handleExceptions: true,
              json: true,
              maxsize: 5242880, //5MB
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

    logger.transports.console.level = 'verbose';


    // new console.log
    console.log = logger.info;
    console.verbose = logger.verbose;

    callback && callback(logger);
  });

}
