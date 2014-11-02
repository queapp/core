var mongoose = require('mongoose');
var _ = require("underscore");

// schema for a service
var thingSchema = mongoose.Schema({
  "name": String,
  "desc": String,
  "type": String,
  "id": Number,
  "image": String,
  "tags": Array,
  "ip": {
    "host": String,
    "port": Number
  },
  "data": Object
});

// schema for a thing
var serviceSchema = mongoose.Schema({
  "name": String,
  "desc": String,
  "type": String,
  "id": Number,
  "image": String,
  "tags": Array,
  "ip": {
    "host": String,
    "port": Number
  },
  "data": Object
});

// schema for a block
var blockSchema = mongoose.Schema({
  "name": String,
  "desc": String,
  "id": Number,
  "tags": Array,
  "code": Array
});

// schema for an authkey
var authKeySchema = mongoose.Schema({
  "type": String,
  "key": String
});

// schema for a notification
var notifySchema = mongoose.Schema({
  "id": Number,
  "title": String,
  "body": String,
  "icon": String
});

// the models

// The three user-creatable items
var Thing = mongoose.model('Thing', thingSchema);
var Service = mongoose.model('Service', serviceSchema);
var Block = mongoose.model('Block', blockSchema);

// others
var Authkey = mongoose.model('Authkey', authKeySchema);
var Notify = mongoose.model('Notify', notifySchema);



var db = module.exports = {
  db: null,
  isOpen: false,

  connect: function(host) {
    var root = this;

    // connect to mongo database
    mongoose.connect(host);
    this.db = mongoose.connection;

    this.db.on('error', console.error.bind(console, 'connection error:'));

    this.db.once('open', function() {
      root.isOpen = true;
      console.log("Connected To Mongo instance:", host);
    });
  },

  addThing: function(data, callback) {
    data.type = "thing";
    var thing = new Thing(data);
    thing.save(callback);
  },

  deleteThing: function(id, callback) {
    Thing.remove({id: id}, function(err, docs) {
      callback(err);
    });
  },

  findAllThings: function(callback) {
    Thing.find(function(err, docs) {
      ret = [];
      _.each(docs, function(doc) {

        // convert to object from model
        ob = doc.toObject();
        delete ob._id;

        // add to array
        ret.push(ob);
      });

      callback(err, ret);
    });
  },

  findThingById: function(id, callback) {
    Thing.findOne({id: id}, function(err, doc) {
      // convert to object from model
      ob = doc.toObject();
      delete ob._id;

      // callback
      callback(err, ob);
    });
  },

  updateThingById: function(id, data, callback) {
    Thing.update({id: id}, data, {}, callback);
  },

  setThingAuthKey: function(akey) {
    // remove all current authkeys (there can only be one!)
    Authkey.remove({type: "thing"}, function(err) {

      // add our new one
      var authkey = new Authkey();
      authkey.type = "thing";
      authkey.key = akey;
      authkey.save();

    });
  },

  getThingAuthKey: function(callback) {
    // get the current thing authkey
    Authkey.findOne({type: "thing"}, function(err, doc) {
      // convert to object from model
      ob = doc.toObject();
      delete ob._id;

      // callback
      callback(err, ob.key);
    });
  },

  setServiceAuthKey: function(akey) {
    // remove all current authkeys (there can only be one!)
    Authkey.remove({type: "service"}, function(err) {

      // add our new one
      var authkey = new Authkey();
      authkey.type = "service";
      authkey.key = akey;
      authkey.save();

    });
  },

  getServiceAuthKey: function(callback) {
    // get the current thing authkey
    Authkey.findOne({type: "service"}, function(err, doc) {
      // convert to object from model
      ob = doc.toObject();
      delete ob._id;

      // callback
      callback(err, ob.key);
    });
  },


  // service stuff (reading them, adding them, and deleting them)
  addService: function(data, callback) {
    data.type = "service";
    var thing = new Service(data);
    thing.save(callback);
  },

  deleteService: function(id, callback) {
    Service.remove({id: id}, function(err, docs) {
      callback(err);
    });
  },

  findAllServices: function(callback) {
    Service.find(function(err, docs) {
      ret = [];
      _.each(docs, function(doc) {

        // convert to object from model
        ob = doc.toObject();
        delete ob._id;

        // add to array
        ret.push(ob);
      });

      callback(err, ret);
    });
  },

  findServiceById: function(id, callback) {
    Service.findOne({id: id}, function(err, doc) {
      // convert to object from model
      ob = doc.toObject();
      delete ob._id;

      // callback
      callback(err, ob);
    });
  },

  updateServiceById: function(id, data, callback) {
    Service.update({id: id}, data, {}, callback);
  },


  // blocks
  addBlock: function(data, callback) {
    var block = new Block(data);
    block.save(callback);
  },

  deleteBlock: function(id, callback) {
    Block.remove({id: id}, function(err, docs) {
      callback(err);
    });
  },

  findAllBlocks: function(callback) {
    Block.find(function(err, docs) {
      ret = [];
      _.each(docs, function(doc) {

        // convert to object from model
        ob = doc.toObject();
        delete ob._id;

        // add to array
        ret.push(ob);
      });

      callback(err, ret);
    });
  },

  findBlockById: function(id, callback) {
    Block.findOne({id: id}, function(err, doc) {
      // convert to object from model
      ob = doc.toObject();
      delete ob._id;

      // callback
      callback(err, ob);
    });
  },

  updateBlockById: function(id, data, callback) {
    Block.update({id: id}, data, {}, callback);
  },


  // notifys
  addNotify: function(data, callback) {
    var notify = new Notify(data);
    notify.save(callback);
  },

  deleteNotify: function(id, callback) {
    Notify.remove({id: id}, function(err, docs) {
      callback(err);
    });
  },

  findAllNotifys: function(callback) {
    Notify.find(function(err, docs) {
      ret = [];
      _.each(docs, function(doc) {

        // convert to object from model
        ob = doc.toObject();
        delete ob._id;

        // add to array
        ret.push(ob);
      });

      callback(err, ret);
    });
  },

  findNotifyById: function(id, callback) {
    Notify.findOne({id: id}, function(err, doc) {
      // convert to object from model
      ob = doc.toObject();
      delete ob._id;

      // callback
      callback(err, ob);
    });
  }

};

// db.connect('mongodb://dev:dev@ds045970.mongolab.com:45970/queapp')
// db.findAll(function(err, ob) {
//   console.log(ob)
//   // db.updateById(1, ob, console.log.bind(console));
// });
/*
console.log("connected")

// schema for a thing
var thingSchema = mongoose.Schema({
  "name": String,
  "desc": String,
  "type": String,
  "id": Number,
  "image": String,
  "tags": Array,
  "ip": {
    "host": String,
    "port": Number
  },
  "data": Object
});

var Thing = mongoose.model('Thing', thingSchema);

var example = new Thing({
  "name": "Example Thing",
  "desc": "Prooves that stuff works",
  "type": "thing",
  "id": 1,
  "image": null,
  "tags": [
    "light"
  ],
  "ip": {
    "host": null,
    "port": null
  },
  "data": {
    "message": {
      "value": "Hello World"
    },
    "showMessage": {
      "value": false,
      "label": "Show Message"
    }
  }
});

example.save(function(err, e) {
  console.log(e)
});
*/
