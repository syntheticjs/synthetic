define(function() {
	return function() {
        /*
        Creates new angular app
        */
        Synthetic.$$angularApp = angular.module('syntheticApp', [], function() {
                                                        
        }.bind(this));

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
            /*
            Эта функция будет применять изменения лишь каждые 100 ms
            */
            $$applyPortions = {
                timer:0,
                applies:[]
            };
            /*
            TODO: проверить необходимость данной функцией, она была введена в sx
            как одна из мер разгрузки процессора
            */
            Synthetic.$$applyPortion = function(changes) {
                
                $$applyPortions.applies.push(changes);

                if ($$applyPortions.timer>0) clearTimeout($$applyPortions.timer);
                
                $$applyPortions.timer = setTimeout(function(){
                    $$applyPortions.timer = 0;
                    var applies = $$applyPortions.applies;
                    console.log("%c$applyPortion", "color:pink;", applies.length);
                    $$applyPortions.applies=[];
                    for (var i = 0;i<applies.length;++i) {
                        applies[i]();
                    }
                }, 20);
            };
        });

        /*
        * * * * * * * * * * * * *
        *  Angular bootstraping * =================| 
        * * * * * * * * * * * * *
        */
        if ("object"!==typeof angular.element(document.body).injector()) {
            /*
            Средство решающее проблемы бутстрапинга на firefox и safari
            Производить инициализациб
            */
            angular.element(document.body).ready(function() {
                /*
                Создаем отчетные данные по использованию jQuery в angular
                */
                Synthetic.$angularjQueryPowered = "function" === typeof angular.element.noConflict;
                /*
                Инициализация контроллера
                */
                var ngCtrl = Synthetic.$$angularApp.controller("syntheticController", function($element, $scope) {
                    
                });
                Synthetic.$$angularCtrl = ngCtrl;

                document.body.setAttribute("ng-jq", "");
                document.body.setAttribute("ng-controller", "syntheticController");

                
                    angular.bootstrap(document.body, [ "syntheticApp" ]);
                    Synthetic.$$angularBootstraped = true;
                    Synthetic.trigger("angularBootstraped");

                
            }.bind(this));
        }
	}
});