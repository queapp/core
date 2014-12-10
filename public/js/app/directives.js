var app = angular.module("QueGui");

// app.directive("thingCardList", function() {
//   return {
//     restrict: 'E',
//     templateUrl: "js/directives/thing-card-list.html"
//   }
// });
//
// app.directive("serviceCardList", function() {
//   return {
//     restrict: 'E',
//     templateUrl: "js/directives/service-card-list.html"
//   }
// });
//
// app.directive("blockList", function() {
//   return {
//     restrict: 'E',
//     templateUrl: "js/directives/blocks-list.html"
//   }
// });
//
// app.directive("dashboardOverview", function() {
//   return {
//     restrict: 'E',
//     templateUrl: "js/directives/dashboard-overview.html"
//   }
// });

// for bootstrap tooltips
app.directive('tooltip', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){
            $(element).hover(function(){
                // on mouseenter
                $(element).tooltip('show');
            }, function(){
                // on mouseleave
                $(element).tooltip('hide');
            });
        }
    };
});
