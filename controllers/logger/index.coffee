###*
Logging Controller. This module manages the logging formatting and the
logging to file and stdout/stderr.
@module controller/logger
###
winston = require("winston")
path = require("path")
mkdirp = require("mkdirp")
_ = require("underscore")
module.exports = (argv, callback) ->
  
  # make the logger directory if it doesn't exist
  mkdirp process.env.LOGTO or argv.logto or "logs", (err) ->
    
    # return with error if one exists
    callback err  if err
    
    # create logger
    logger = new winston.Logger(
      transports: [
        new winston.transports.File(
          level: "info"
          filename: path.join(process.env.LOGTO or argv.logto or "logs", "que.log")
          handleExceptions: true
          json: true
          maxsize: 5242880 # 5MB
          maxFiles: 5
          colorize: false
        )
        new winston.transports.Console(
          level: "debug"
          handleExceptions: true
          json: false
          colorize: true
        )
      ]
      exitOnError: false
    )
    
    # set minimum log level
    # logger.transports.console.level = 'verbose';
    
    # new console.log
    console.log = ->
      
      # iterate through the arguments, JSON.stringifying the
      # necessary types for better formatting
      args = _.map(arguments, (arg) ->
        if typeof arg is "object"
          JSON.stringify arg
        else
          arg
      )
      
      # call the logger
      logger.info.apply logger, args
      return

    
    # callback with logger object
    callback and callback(logger)
    return

  return
