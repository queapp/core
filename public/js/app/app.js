var app = angular.module("QueGui", ["ngAnimate", "ngRoute"]);

// the top nav colors
var navColorYellow = "#FCBD4B";
var navColorRed = "#FC4B4B";
var navColorBlue = "#4BA9FC";
var navColorGreen = "#42BF3F";
var navColorBrown = "#D481DC";

app.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
      when('/dash', {
        templateUrl: 'views/dashboard-overview.html',
        controller: 'DashboardController'
      }).
      when('/things', {
        templateUrl: 'views/thing-card-list.html',
        controller: 'ThingsController'
      }).
      when('/rooms', {
        templateUrl: 'views/room-list.html',
        controller: 'RoomsController'
      }).
      when('/blocks', {
        templateUrl: 'views/blocks-list.html',
        controller: 'BlockController'
      }).
      when('/settings', {
        templateUrl: 'views/settings-list.html',
        controller: 'KeysController'
      }).
      when('/login', {
        templateUrl: 'views/login.html',
        controller: 'LoginController'
      }).when('/queryresults', {
        templateUrl: 'views/query-results.html'
      }).
      otherwise({redirectTo: '/login'});
}]);

app.controller("navController", function($scope, $rootScope, $http, loginService, $location) {
  var root = this;

  this.pageId = 1;
  this.version = "";

  // log the original route
  this.firstRoute = null;

  // reference to loginservice
  this.user = loginService;

  // check if this is a new que instance
  this.user.isNewInstance(function(newInstance) {
    // console.log(newInstance)
  });

  // get version from backend
  $http({
    method: "get",
    url: "/version"
  }).success(function(data) {
    root.version = "v"+data.version;
  });

  $rootScope.$on( "$routeChangeStart", function(event, next, current) {
    // if this is the first route we go to, log it
    // why? later on once auth is done, we will redirect back here.
    if (root.firstRoute === null && current !== undefined )
      root.firstRoute = current.$$route.originalPath;

    // test to see if the authtoken is persisted
    if (root.user && root.user.auth.username === null && sessionStorage && sessionStorage.queKey) {
      root.user.loginWithKey(sessionStorage.queKey, function(data) {
        root.user.auth = data;

        // serve the dash, because after logging in the login page isn't needed
        if ($location.url() === "/login") $location.url( root.firstRoute || "/dash" );
      });
    };

    // if the user isn't logged in, redirect them to the login page
    if (root.user && root.user.auth.username === null && next.$$route.originalPath !== "/login") $location.url("/login");

    // but, if the user is on the login page, redirect them to the dash as long as their logged in
    if (root.user.auth.username !== null && $location.url() === "/login") $location.url("/dash");

    // which page?
    switch(next.$$route.originalPath) {
      case "/dash":
        root.toPage(0);
        break;
      case "/things":
        root.toPage(1);
        break;
      case "/rooms":
        root.toPage(2);
        break;
      case "/blocks":
        root.toPage(3);
        break;
      case "/settings":
        root.toPage(4);
        break;
    }
  });

  this.toPage = function(id) {

    // set page id
    this.pageId = id;

    // fade the colors in the top navbar
    $(".navbar-que").animate({
      backgroundColor: root.getPageColor()
    }, 350);
  }


  // get title area of navbar's color
  this.getPageColor = function() {
    switch (this.pageId) {
      case 0:
        return navColorYellow;
        break;
      case 1:
        return navColorGreen;
        break;
      case 2:
        return navColorBlue;
        break;
      case 3:
        return navColorRed;
        break;
      case 4:
        return navColorBrown;
        break;
      default:
        return "transparent";
        break;
    }
  }

  // get the page's title
  this.getPageTitle = function() {
    switch (this.pageId) {
      case 0:
        return {title: "Overview", desc: "Overview of everything happening on this Que instance"};
        break;
      case 1:
        return {title: "My Things", desc: "A list of all your things"};
        break;
      case 2:
        return {title: "My Rooms", desc: "Groups of things that correspond to each physical room the things are in"};
        break;
      case 3:
        return {title: "Blocks", desc: "Blocks are what tell your things and services how to work"};
        break;
      case 4:
        return {title: "Settings", desc: "Adjust preferences for this Que instance"};
        break;
      default:
        return {title: "", desc: ""}
        break;
    }
  }

  this.toPage(0); // go to thing page to start (for now, will be changed back to dashboard later)
});

app.controller("DashboardController", function($scope, thingService, roomsService, notificationService) {
  var root = $scope;
  root.notifications = [];

  // thing count
  root.thingCount = 0;
  root.getThingCount = function() {
    thingService.getAllThings(function(data) {
      root.thingCount = data.length;
    });
  }
  root.getThingCount();

  root.roomCount = 0;
  root.getRoomCount = function() {
    roomsService.getAllThings(function(data) {
      root.roomCount = data.length;
    });
  };
  root.getRoomCount();

  // notifications
  root.refetch = function() {
    notificationService.getNotifications(function(data) {
      root.notifications = data;
    });
  };

  // dismiss notification
  root.dismiss = function(id) {
    notificationService.dismissNotification(id);
    toDismiss = _.filter(root.notifications, function(i) {
      return i.id == id;
    });
    root.notifications.splice(root.notifications.indexOf(toDismiss[0]), 1);
    root.refetch();
  };


  // update notifications
  socket.on('backend-data-change', function(data) {
    data === "notify" && root.refetch();
  });

  root.refetch();
});


app.factory("thingService", function($http) {
    thingservice = {
      cache: {},
      count: 0,

      getAllThings: function(callback) {
        var r = this;
        // first, check cache
        if (!$.isEmptyObject(this.cache)) {
          // console.log("cache", this.cache)
          callback(this.cache);
        } else {
          // console.log("req")
          // fall back to http request
          $http({
            method: "get",
            url: host + "/things/all",
          }).success(function(data) {
            // console.log("-> done", data)
            r.cache = data.data;
            callback(data.data);
          });
        };
      },

      // get thing data
      // try from cache, but fall back onto
      // a http request
      getThingData: function(id, callback) {
        if (this.cache[id]) {
          callback(this.cache[id]);
        } else {
          $http({
            method: "get",
            url: host + "/things/" + id + "/data",
          }).success(function(data) {
            this.cache = {};
            callback(data);
          });
        }
      },

      updateThingData: function(id, data, callback) {
        // push it back to te server
        socket.emit('push-thing-data-update', {
          id: id,
          data: data,
          auth: sessionStorage.queKey
        });

        // clear cache - update was made
        this.cache = {};

        // $http({
        //   method: "put",
        //   url: host + "/things/" + id + "/data",
        //   data: JSON.stringify(data)
        // }).success(function(data) {
        //   callback(data);
        // });
      },

      // reorderThing: function(id, newLocation, callback) {
      //   $http({
      //     method: "get",
      //     url: host + "/things/" + id + "/location/" + newLocation,
      //   }).success(function(data) {
      //     callback(data);
      //   });
      // },

      removeThing: function(id, callback) {
        $http({
          method: "delete",
          url: host + "/things/" + id,
        }).success(function(data) {
          // clear cache - update was made
          this.cache = {};
          callback(data);
        });
      }
    };

    // update thing cache
    socket.on('backend-data-change', function(payload) {
      if (payload && payload.type === "thing") {
        // console.log(payload)
        thingservice.cache = payload.data;
      }
    });
    socket.on('pull-thing-data-update', function(changed) {

      // create the item if it doesn't exist
      if (!thingservice.cache[changed.id]) {
        thingservice.cache[changed.id] = {};
      }

      // update cache
      _.each(changed.data, function(v, k) {
        thingservice.cache[changed.id][k] = v;
      });

    });
    return thingservice;
 });

app.factory("tokenService", function($http) {
  tokenService = {
    tokens: {},
    get: function(callback) {
      var r = this;
      $http({
        method: "get",
        url: host + "/tokens",
      }).success(function(data) {
        r.tokens = data;
        callback && callback(data);
      });
    }
  };

  tokenService.get();
  return tokenService;
});

app.factory("roomsService", function($http) {
    roomservice = {
      cache: {},
      count: 0,

      getAllThings: function(callback) {
        var r = this;
        // first, check cache
        if (!$.isEmptyObject(this.cache)) {
          // console.log("cache")
          callback(this.cache);
        } else {
          // console.log("req")
          // fall back to http request
          $http({
            method: "get",
            url: host + "/rooms/all",
          }).success(function(data) {
            // console.log(data.data)
            r.cache = data.data;
            callback(data.data);
          });
        };
      },

      getThingData: function(id, callback) {
        if (this.cache[id]) {
          callback(this.cache[id]);
        } else {
          $http({
            method: "get",
            url: host + "/rooms/" + id + "/data",
          }).success(function(data) {
            this.cache = {};
            callback(data);
          });
        }
      },

      addThing: function(id, tid, callback) {
        $http({
          method: "post",
          url: host + "/rooms/" + id + "/addthing",
          data: JSON.stringify({id: tid})
        }).success(function(data) {
          this.cache = {};
          callback(data);
        });

        // $http({
        //   method: "put",
        //   url: host + "/rooms/" + id + "/data",
        //   data: JSON.stringify(data)
        // }).success(function(data) {
        //   callback(data);
        // });
      },

      add: function(data, callback) {
        $http({
          method: "post",
          url: host + "/rooms/add",
          data: JSON.stringify(data)
        }).success(function(data) {
          callback && callback(data);
        });
      },

      remove: function(id, callback) {
        $http({
          method: "delete",
          url: host + "/rooms/" + id
        }).success(function(data) {
          callback && callback(data);
        });
      },

      removeThing: function(rid, tid, callback) {
        $http({
          method: "delete",
          url: host + "/rooms/" + rid + "/" + tid,
        }).success(function(data) {
          this.cache = {};
          callback(data);
        });
      },

      updateUsers: function(room, callback) {
        $http({
          method: "post",
          url: host + "/rooms/" + room.id + "/users",
          data: JSON.stringify({users: room.usersInside})
        }).success(function(data) {
          this.cache = {};
          callback && callback(data);
        });
      },

      updateThings: function(id, things, callback) {
        $http({
          method: "post",
          url: host + "/rooms/" + id + "/things",
          data: angular.toJson({things: things})
        }).success(function(data) {

          // update room data
          socket.emit('data-change', {
            type: "room",
            id: id,
            data: [{id: id, things: things}]
          });

          this.cache = {};
          callback && callback(data);
        });
      }

    };

    // update room chache
    socket.on('backend-data-change', function(payload) {
      if (payload && payload.type === "room") {
        roomservice.cache = {}//Object.deepExtend(roomservice.cache, payload.data);
      }
    });

    socket.on('pull-room-data-update', function(changed) {

      // create the item if it doesn't exist
      if (!roomservice.cache[changed.id]) {
        roomservice.cache[changed.id] = {};
      }

      // update cache
      _.each(changed.data, function(v, k) {
        roomservice.cache[changed.id][k] = v;
      });

      console.log(JSON.stringify(changed, null, 2))
    });
    return roomservice;
 });

app.factory("blockService", function($http) {
    blockservice = {
      cache: {},

      addBlock: function(data, callback) {
        $http({
          method: "post",
          url: host + "/blocks/add",
          data: JSON.stringify(data)
        }).success(function(data) {
          this.cache = {};
          callback && callback(data.id || data);
        });
      },

      removeBlock: function(id, callback) {
        $http({
          method: "delete",
          url: host + "/blocks/"+id
        }).success(function(data) {
          this.cache = {};
          callback && callback(data);
        });
      },

      getAllBlocks: function(callback) {
        var r = this;
        // first, check cache
        if (!$.isEmptyObject(this.cache)) {
          // console.log("cache")
          callback(this.cache);
        } else {
          // console.log("req")
          // fall back to http request
          $http({
            method: "get",
            url: host + "/blocks/all",
          }).success(function(data) {
            // console.log(123)
            r.cache = data.data;
            callback(data.data);
          });
        };
      },

      getBlockData: function(id, callback) {
        if (this.cache[id]) {
          callback(this.cache[id]);
        } else {
          $http({
            method: "get",
            url: host + "/blocks/" + id + "/code",
          }).success(function(data) {
            this.cache = {};
            callback(data);
          });
        }
      },

      updateBlockData: function(id, data, callback) {
        $http({
          method: "put",
          url: host + "/blocks/" + id + "/code",
          data: JSON.stringify(data)
        }).success(function(data) {
          this.cache = {};
          callback(data);
        });
      }

    };
    return blockservice;
 });

app.service("notificationService", function($http) {
 notificationservice = {
   cache: {},

   addNotification: function(data, callback) {
     $http({
       method: "post",
       url: host + "/notify/add",
       data: JSON.stringify(data)
     }).success(function(data) {
       callback && callback(data.id || data);
     });
   },

   dismissNotification: function(id, callback) {
     $http({
       method: "delete",
       url: host + "/notify/"+id
     }).success(function(data) {
       callback && callback(data);
     });
   },

   getNotifications: function(callback) {
     $http({
       method: "get",
       url: host + "/notify/all",
     }).success(function(data) {
       callback(data.data);
     });
   }

 };
 return notificationservice;
});

/**
 * Deeply extend an object from another object
 * @param {object} destination The destination object to extend to
 * @param {object} source      The object to extend from into destination
 */
Object.deepExtend = function(destination, source) {
  for (var property in source) {
    if (source[property] && source[property].constructor &&
     source[property].constructor === Object) {
      destination[property] = destination[property] || {};
      arguments.callee(destination[property], source[property]);
    } else {
      destination[property] = source[property];
    }
  }
  return destination;
};
