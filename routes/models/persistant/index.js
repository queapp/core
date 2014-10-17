var path = require("path");
var fs = require("fs");
var _ = require("underscore");

// where to write the persistant data
var fileName = path.join(__dirname, "persistant.json");
var persistantInstance = null;


/**
  Persistant data storage
  Used by thing and service model to write persistant data
  to disk. It's somewhat smart in that it only writes when there
  is a data change, insead of every 'frame', which saves time and
  disk write cycles.
*/
module.exports = {
  cache: {},
  update: false,
  updateFrequency: 1000, // time between update frames

  /**
    Initialize the file storage auto-updater
  */
  init: function() {
    var root = this;

    // is one already made?
    if (persistantInstance) {
      return persistantInstance;
    } else {
      persistantInstance = this;
    }

    // auto-updating of the data structure
    setInterval(function(){
      if (root.update) {
        // write to file if data has changed
        root.putCache(function(){
          // console.log("put to file");
          root.update = false;
        });
      } else {
        // otherwise, read from file any changes
        root.getCache(function(status, similarity) {
          // console.log("read: s:", status, "sim:", similarity);
        });
      }

    }, this.updateFrequency);

    // start by getting from the file, otherwise
    // we'll start with a blank cache
    root.getCache();

    // return the instance
    return this;
  },

  /**
    Set data contents for a specific name
  */
  write: function(name, data, callback) {
    this.cache[name] = data;
    this.update = true;
    callback && callback();
  },

  /**
    Read data contents for a specific name
  */
  read: function(name) {
    return name && this.cache[name] || this.cache;
  },

  /**
    Sync the data to the file
  */
  putCache: function(done) {
    txt = JSON.stringify(this.cache, null, 2);
    fs.writeFile(fileName, txt, function(err) {
      !err && done && done();
    });
  },

  /**
    Sync the data from the file into the cache
  */
  getCache: function(done) {
    var root = this;

    fs.readFile(fileName, 'utf8', function(err, data) {
      if (!err) {
        parsed = JSON.parse(data);
        if (parsed) {
          // are the old cache and the new cache equal?
          var similarity = _.isEqual(root.cache, parsed);
          root.cache = parsed;
          done && done(true, similarity);
        } else {
          // error
          done && done(false, null);
        }
      }
    });
  }


}
