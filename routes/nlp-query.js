var ImpParser = require("imperative-nlp");
var userCan = require("../controllers/auth").canMiddleware;

module.exports = function(app, things) {

  // parse a query
  parseQuery = function(input, callback) {
    // get all things
    things.get(null, function(things) {

      // do the parsing
      nlpParser = new ImpParser();
      nlpParser.data = things;
      nlpParser.matchMeaning(input, callback);

    });
  };


  // post a natural query to que to turn on/off
  // or do another action. This doesn't do the query,
  // but just returns the crucial parts of a query
  app.post("/natural/parser", function(req, res) {

    // parse the query
    parseQuery(req.body.data || '', function(thing, operation, dataItem) {

      // send out the output
      res.send({
        thing: thing,
        operation: operation,
        data: dataItem
      });
    });
  });

  // do a natural-language query
  app.post("/natural/query", function(req, res) {

    // start by parsing the query
    parseQuery(req.body.data || '', function(thing, operation, dataItem) {

      // is the thing defined?
      if (!thing) {
        res.send(things.createResponsePacket('ERR', {
          msg: "The thing you're trying to control doesn't exist.",
          err: "NO_THING"
        }));
        return;
      };

      // no data item?
      if (!dataItem) {
        res.send(things.createResponsePacket('ERR', {
          msg: "The control you're refering to doesn't exist.",
          err: "NO_DATA_ITEM"
        }));
        return;
      }


      // create temporary object
      hash = {};

      // next, start going through the operations
      switch(operation) {

        // enable: turn the specified data item on
        case "enable":
          hash[dataItem] = {value: true};
          things.update(thing.id, hash, function() {
            res.send(things.createResponsePacket('OK', {resp: true}));
          });
          break;

        // disable: turn the specified data item off
        case "disable":
          hash[dataItem] = {value: false};
          things.update(thing.id, hash, function() {
            res.send(things.createResponsePacket('OK', {resp: true}));
          });
          break;

        // toggle: flip the state of the specified data item
        case "toggle":
          hash[dataItem] = { value: !thing.data[dataItem].value };
          things.update(thing.id, hash, function() {
            res.send(things.createResponsePacket('OK', {resp: true}));
          });
          break;

        // check the status (if it's on, off, or something else)
        case "status_default_true":
        case "status_default_false":
        case "status":
          res.send(things.createResponsePacket('OK', {resp: thing.data[dataItem].value}));
          break;

        // if nothing matched, then the operator is null or unknown
        default:
          res.send(things.createResponsePacket('ERR', {
            msg: "Try phrasing what you want to say a little differently.",
            err: "NO_OPERATOR_IN_PHRASE"
          }));
      };

    });

  });

};
