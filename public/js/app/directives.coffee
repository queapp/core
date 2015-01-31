app = angular.module("QueGui")
app.directive "newInstance", ->
  restrict: "E"
  templateUrl: "views/new-instance.html"


#
# app.directive("serviceCardList", function() {
#   return {
#     restrict: 'E',
#     templateUrl: "js/directives/service-card-list.html"
#   }
# });
#
# app.directive("blockList", function() {
#   return {
#     restrict: 'E',
#     templateUrl: "js/directives/blocks-list.html"
#   }
# });
#
# app.directive("dashboardOverview", function() {
#   return {
#     restrict: 'E',
#     templateUrl: "js/directives/dashboard-overview.html"
#   }
# });

# for bootstrap tooltips
app.directive "tooltip", ->
  restrict: "A"
  link: (scope, element, attrs) ->
    $(element).hover (->
      
      # on mouseenter
      $(element).tooltip "show"
      return
    ), ->
      
      # on mouseleave
      $(element).tooltip "hide"
      return

    return

