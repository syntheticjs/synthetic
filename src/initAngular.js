define(function() {
	return function() {
        /*
        Creates new angular app
        */
        Synthetic.$$angularApp = angular.module('syntheticApp', [], function() {
                                                        
        }.bind(this))
        .filter('tester', function() {
            var args =  arguments;
            return function(items, property, value) {
                
                var filtered = [],to;
                if ("undefined"===typeof items) return false;
                for (var i = 0;i<items.length;++i) {
                    to=sx.cache.getSync('entity', items[i].objectId);
                    if (to&&to[property]===value) filtered.push(items[i])
                }
                
                return filtered;
            }
        });

        /*
        Вызываем событие оповещающее глобвльно о создании модуля angular
        */
        Synthetic.trigger("angularModuleInitialed", [Synthetic.$$angularApp]);

        /*
        Этот чанк поможет разрешить проблему постинициализации контроллеров angular
        */
        // After the AngularJS has been bootstrapped, you can no longer
        // use the normal module methods (ex, app.controller) to add
        // components to the dependency-injection container. Instead, 
        // you have to use the relevant providers. Since those are only
        // available during the config() method at initialization time,
        // we have to keep a reference to them.
        // --
        // NOTE: This general idea is based on excellent article by 
        // Ifeanyi Isitor: http://ify.io/lazy-loading-in-angularjs/
        Synthetic.$$angularApp.config(
            function( $controllerProvider, $provide, $compileProvider ) {

                // Since the "shorthand" methods for component 
                // definitions are no longer valid, we can just 
                // override them to use the providers for post-
                // bootstrap loading.

                // Let's keep the older references.
                Synthetic.$$angularApp._controller = Synthetic.$$angularApp.controller;
                Synthetic.$$angularApp._service = Synthetic.$$angularApp.service;
                Synthetic.$$angularApp._factory = Synthetic.$$angularApp.factory;
                Synthetic.$$angularApp._value = Synthetic.$$angularApp.value;
                Synthetic.$$angularApp._directive = Synthetic.$$angularApp.directive;

                // Provider-based controller.
                Synthetic.$$angularApp.controller = function( name, constructor ) {

                    $controllerProvider.register( name, constructor );
                    return( this );

                };
                
                // Provider-based service.
                Synthetic.$$angularApp.service = function( name, constructor ) {

                    $provide.service( name, constructor );
                    return( this );

                };

                // Provider-based factory.
                Synthetic.$$angularApp.factory = function( name, factory ) {

                    $provide.factory( name, factory );
                    return( this );

                };

                // Provider-based value.
                Synthetic.$$angularApp.value = function( name, value ) {

                    $provide.value( name, value );
                    return( this );

                };

                // Provider-based directive.
                Synthetic.$$angularApp.directive = function( name, factory ) {

                    $compileProvider.directive( name, factory );
                    return( this );

                };

                // NOTE: You can do the same thing with the "filter"
                // and the "$filterProvider"; but, I don't really use
                // custom filters.

            }
        ).run(function($rootScope, $compile, $q, $timeout) {
            Synthetic.$$angularRootScope = $rootScope;
            Synthetic.$$angularRCompile = $compile;
            Synthetic.$$angularCompile = $compile;
            Synthetic.$$angularQ = $q;
            Synthetic.$$angularTimeout = $timeout;
        });

        /*
        * * * * * * * * * * * * *
        *  Angular bootstraping * =================| 
        * * * * * * * * * * * * *
        */
        if ("object"!==typeof angular.element(document.body).injector()) {

            Synthetic.$$angularApp.controller('syntheticController', 
                function ($element, $scope) {
                    
                }
            );

            document.body.setAttribute('ng-jq', '');
            document.body.setAttribute('ng-controller', 'syntheticController');

            angular.element(document.body).ready(function() {
                    setTimeout(function() {
                        angular.bootstrap(document.body, 
                        ['syntheticApp']);
                        Synthetic.$$angularBootstraped = true;
                        
                        Synthetic.trigger('angularBootstraped');
                    }, 100);
            }.bind(this));
        }
	}
});