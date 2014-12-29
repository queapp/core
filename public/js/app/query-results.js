app.controller("QueryResultsController", function($scope, $http, $location) {
  var root = this;

  // each results section
  this.results = {};

  this.queryText = "";

  this.doQuery = function(query) {
    $http({
      method: "post",
      url: host+"/natural/query",
      data: {
        data: query || this.queryText
      }
    }).success(function(data) {
      root.results = data;

      // goto query results page
      $location.url("/queryresults");
    });
  };


});
