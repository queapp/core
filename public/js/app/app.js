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
      when('/services', {
        templateUrl: 'views/service-card-list.html',
        controller: 'ServicesController'
      }).
      when('/blocks', {
        templateUrl: 'views/blocks-list.html',
        controller: 'BlockController'
      }).
      when('/settings', {
        templateUrl: 'views/settings-list.html',
        controller: 'ServicesController'
      }).
      when('/login', {
        templateUrl: 'views/login.html',
        controller: 'LoginController'
      }).
      otherwise({redirectTo: '/login'});
}]);

app.controller("navController", function($scope, $rootScope, $http, loginService) {
  var root = this;

  this.pageId = 1;
  this.version = "";

  // reference to loginservice
  this.user = loginService;

  // get version from backend
  $http({
    method: "get",
    url: "/version"
  }).success(function(data) {
    root.version = "v"+data.version;
  });

  $rootScope.$on( "$routeChangeStart", function(event, next, current) {
    // which page?
    switch(next.$$route.originalPath) {
      case "/dash":
        root.toPage(0);
        break;
      case "/things":
        root.toPage(1);
        break;
      case "/services":
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
        return {title: "My Services", desc: "A list of all services linked to this Que instance"};
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

app.controller("DashboardController", function($scope, servicesService, thingService, notificationService) {
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

  // service count
  root.serviceCount = 0;
  root.getServiceCount = function() {
    servicesService.getAllThings(function(data) {
      root.serviceCount = data.length;
    });
  }
  root.getServiceCount();

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
        $http({
          method: "get",
          url: host + "/things/all",
        }).success(function(data) {
          r.count = data.data.length;
          callback(data.data);
        });
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
            thingservice.cache = data;
            callback(data);
          });
        }
      },

      updateThingData: function(id, data, callback) {
        // push it back to te server
        socket.emit('push-thing-data-update', {
          id: id,
          data: data
        });

        // $http({
        //   method: "put",
        //   url: host + "/things/" + id + "/data",
        //   data: JSON.stringify(data)
        // }).success(function(data) {
        //   callback(data);
        // });
      },

      reorderThing: function(id, newLocation, callback) {
        $http({
          method: "get",
          url: host + "/things/" + id + "/location/" + newLocation,
        }).success(function(data) {
          callback(data);
        });
      },

      removeThing: function(id, callback) {
        $http({
          method: "delete",
          url: host + "/things/" + id,
        }).success(function(data) {
          callback(data);
        });
      }
    };

    // update thing cache
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

app.factory("servicesService", function($http) {
    serviceservice = {
      cache: {},

      getAllThings: function(callback) {
        $http({
          method: "get",
          url: host + "/services/all",
        }).success(function(data) {
          callback(data.data);
        });
      },

      getThingData: function(id, callback) {
        if (this.cache[id]) {
          callback(this.cache[id]);
        } else {
          $http({
            method: "get",
            url: host + "/services/" + id + "/data",
          }).success(function(data) {
            serviceservice.cache = data;
            callback(data);
          });
        }
      },

      updateThingData: function(id, data, callback) {
        socket.emit('push-service-data-update', {
          id: id,
          data: data
        });

        // $http({
        //   method: "put",
        //   url: host + "/services/" + id + "/data",
        //   data: JSON.stringify(data)
        // }).success(function(data) {
        //   callback(data);
        // });
      },

      reorderThing: function(id, newLocation, callback) {
        $http({
          method: "get",
          url: host + "/services/" + id + "/location/" + newLocation,
        }).success(function(data) {
          callback(data);
        });
      },

      removeThing: function(id, callback) {
        $http({
          method: "delete",
          url: host + "/services/" + id,
        }).success(function(data) {
          callback(data);
        });
      },

      genAuthKey: function(callback) {
        $http({
          method: "get",
          url: host + "/services/genkey",
        }).success(function(data) {
          callback(data);
        });
      }

    };

    // update thing cache
    socket.on('pull-service-data-update', function(changed) {

      // create the item if it doesn't exist
      if (!serviceservice.cache[changed.id]) {
        serviceservice.cache[changed.id] = {};
      }

      // update cache
      _.each(changed.data, function(v, k) {
        serviceservice.cache[changed.id][k] = v;
      });
    });
    return serviceservice;
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
          callback && callback(data.id || data);
        });
      },

      removeBlock: function(id, callback) {
        $http({
          method: "delete",
          url: host + "/blocks/"+id
        }).success(function(data) {
          console.log(data);
          callback && callback(data);
        });
      },

      getAllBlocks: function(callback) {
        $http({
          method: "get",
          url: host + "/blocks/all",
        }).success(function(data) {
          callback(data.data);
        });
      },

      getBlockData: function(id, callback) {
        if (this.cache[id]) {
          callback(this.cache[id]);
        } else {
          $http({
            method: "get",
            url: host + "/blocks/" + id + "/code",
          }).success(function(data) {
            serviceservice.cache = data;
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
