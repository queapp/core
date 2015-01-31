app = angular.module "QueGui"
app.controller "QueryResultsController", ($scope, $http, $location) ->
  root = this

  # each results section
  @results = {}
  @queryText = ""
  @doQuery = (query) ->
    $http(
      method: "post"
      url: host + "/natural/query"
      data:
        data: query or @queryText
    ).success (data) ->
      root.results = data

      # goto query results page
      $location.url "/queryresults"
      return

    return

  return
