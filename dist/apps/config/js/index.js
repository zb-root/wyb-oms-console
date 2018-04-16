'use strict';

(function(){
    var name = 'config';
    var path = 'apps/'+ name + '/';

    /**
     * Config for the router
     */
    angular.module('app')
        .config(
            [          '$stateProvider', '$urlRouterProvider', 'lazyLoadProvider',
                function ($stateProvider,   $urlRouterProvider, lazyLoadProvider) {
                    $stateProvider
                        .state('app.config', {
                            url: '/config',
                            template: '<div ui-view class="fade-in-down"></div>',
                            controller: "configCtrl",
                            resolve: lazyLoadProvider.load( [path + 'js/controllers/index.js', path + 'js/controllers/config.js'])
                        })
                        .state('app.config.create', {
                            url: '/config_create/{id}',
                            templateUrl: path + 'tpl/config_create.html',
                            controller: 'ConfigCreateCtrl'
                        })
                        .state('app.config.list', {
                            url: '/list',
                            templateUrl: path + 'tpl/config_list.html',
                            controller: 'ConfigCtrl'
                        })
                        .state('app.config.menus', {
                            url: '/menus',
                            templateUrl: path + 'tpl/config.menus.html',
                            controller: 'ConfigMenusCtrl'
                        })
                        .state('app.config.systeminit', {
                            url: '/systeminit',
                            templateUrl:path +  'tpl/config.systeminit.html',
                            controller: 'ConfigSystemInitCtrl',
                            resolve: lazyLoadProvider.load(['ngTagsInput'])
                        })
                        .state('app.config.systemconfig', {
                            url: '/systemconfig',
                            templateUrl:path +  'tpl/config.systemconfig.html',
                            controller: 'ConfigSystemConfigCtrl',
                            resolve: lazyLoadProvider.load( ['../libs/jm/jm-config/dist/js/jm-sdk-config.js'] )
                        })

                        .state('app.config.unified', {
                            url: '/unified',
                            templateUrl:path +  'tpl/config.unified.html',
                            controller: 'ConfigUnifiedCtrl',
                            resolve: lazyLoadProvider.load( ['../libs/jm/jm-config/dist/js/jm-sdk-config.js'] )
                        })
                        .state('app.config.unified.view', {
                            url: '/view',
                            templateUrl: path + 'tpl/config.unified.view.html',
                        })
                    ;
                }
            ]
        );
}());

