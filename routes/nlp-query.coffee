ImpParser = require("imperative-nlp")
userCan = require("../controllers/auth").canMiddleware
module.exports = (app, things) ->
  
  # parse a query
  parseQuery = (input, callback) ->
    
    # get all things
    things.get null, (things) ->
      
      # do the parsing
      nlpParser = new ImpParser()
      nlpParser.data = things
      nlpParser.matchMeaning input, callback
      return

    return

  
  # format data for the user to view
  formatForUser = (a) ->
    if a is true
      "on"
    else if a is false
      "off"
    else
      a

  
  # post a natural query to que to turn on/off
  # or do another action. This doesn't do the query,
  # but just returns the crucial parts of a query
  app.post "/natural/parser", userCan("natural.parse"), (req, res) ->
    
    # parse the query
    parseQuery req.body.data or "", (thing, operation, dataItem) ->
      
      # send out the output
      res.send
        thing: thing
        operation: operation
        data: dataItem

      return

    return

  
  # do a natural-language query
  app.post "/natural/query", userCan("natural.query"), (req, res) ->
    
    # start by parsing the query
    parseQuery req.body.data or "", (thing, operation, dataItem) ->
      
      # is the thing defined?
      unless thing
        res.send things.createResponsePacket("ERR",
          msg: "The thing you're trying to control doesn't exist."
          err: "NO_THING"
        )
        return
      
      # no data item?
      unless dataItem
        res.send things.createResponsePacket("ERR",
          msg: "The control you're refering to doesn't exist."
          err: "NO_DATA_ITEM"
        )
        return
      
      # create temporary object
      hash = {}
      
      # next, start going through the operations
      switch operation
        
        # enable: turn the specified data item on
        when "enable"
          hash[dataItem] = value: true
          things.update thing.id, hash, ->
            res.send things.createResponsePacket("OK",
              resp: true
              msg: "The value of " + thing.name + " has been set to on."
            )
            return

        
        # disable: turn the specified data item off
        when "disable"
          hash[dataItem] = value: false
          things.update thing.id, hash, ->
            res.send things.createResponsePacket("OK",
              resp: true
              msg: "The value of " + thing.name + " has been set to off."
            )
            return

        
        # toggle: flip the state of the specified data item
        when "toggle"
          hash[dataItem] = value: not thing.data[dataItem].value
          things.update thing.id, hash, ->
            res.send things.createResponsePacket("OK",
              resp: true
              msg: "The value of " + thing.name + " has been toggled to be " + formatForUser(not thing.data[dataItem].value) + "."
            )
            return

        
        # check the status (if it's on, off, or something else)
        when "status_default_true", "status_default_false", "status"
          res.send things.createResponsePacket("OK",
            resp: thing.data[dataItem].value
            msg: "The " + thing.name + " is currently " + formatForUser(thing.data[dataItem].value) + "."
          )
        
        # if nothing matched, then the operator is null or unknown
        else
          res.send things.createResponsePacket("ERR",
            msg: "Try phrasing what you want to say a little differently."
            err: "NO_OPERATOR_IN_PHRASE"
          )
      return

    return

  return
