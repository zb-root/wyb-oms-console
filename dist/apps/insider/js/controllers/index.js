'use strict';
app.controller('InsiderCtrl',['$scope','$translatePartialLoader',function ($scope,$translatePartialLoader) {
    $translatePartialLoader.addPart('insider');
}]);