/**
 * Created by sahara on 2017/1/18.
 */
'use strict';

(function(){
    var name = 'insider';
    var path = 'apps/'+ name + '/';

    /**
     * acl for the router
     */
    angular.module('app')
        .config(
            [ '$stateProvider', '$urlRouterProvider', 'lazyLoadProvider',
                function ($stateProvider, $urlRouterProvider, lazyLoadProvider) {
                    $stateProvider
                        .state('app.insider', {
                            url: '/insider',
                            controller: 'InsiderCtrl',
                            template: '<div ui-view class="fade-in-down"></div>',
                            resolve: lazyLoadProvider.load([path + 'js/controllers/index.js'])
                        })
                        .state('app.insider.list', {
                          url: '/insider/list',
                          templateUrl: path +'tpl/insider.html',
                          controller: 'InsiderListCtrl',
                          resolve: lazyLoadProvider.load([path + 'js/controllers/insider.js'])
                        })
                }
            ]
        );
}());