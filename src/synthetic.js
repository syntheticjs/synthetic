/*
AMD Synthet
*/
(function(name, depends, factory) {
	if (define && "function"===typeof define) define(name, depends, factory);
	
})
("synthet", [
    "abstudio~inherit@0.1.4",
	"abstudio~mixin@0.1.0",
	"./classEvents.js",
    './templateManager.js',
    './generator.js',
    "./WebElementPrototype.js",
    "./d3party/watchJS/watch.js",
	"polyvitamins~polychrome@master/gist/convert/camelize.js",
    "./smartCallback.js",
    "./preFactory.js",
    "polyvitamins~polyinherit@master",
	"./d3party/WebReflection/document-register-element.amd.js"
], function(inherit, mixin, eventsClass, templateManager, Generator, WebElementPrototype, WatchJS, camelize, smartCallback, ComponentPreFactory) {
        var regScriptContent = /<script[^>]*>([.\w\d\r\t\n\.\s;'"{}\(\)]*)<\/script>/i,
        regSyntheticScript = /^[\t\r\s]*Synthetic\(/i;
        var Synthetic = function(element) {
            if ("object"===typeof element.synthetic) {
                return element.synthetic;
            } else if ("function"===typeof element) {
                if (Synthetic.$$lastElementFactory) {
                    Synthetic.$$lastElementFactory.$queue(function() { this.$inject(element)(); });
                }
                return false;
            }
            return false;
        };

        Synthetic.prototype = {
            construct: Synthetic
        };

        /*
        CHARGE IT BY EVENT EMITTER * * * * *
        Синтетик генерирует глоабальные события, такие как angularResolved
        */
        for (var prop in eventsClass.prototype) {
            if (eventsClass.prototype.hasOwnProperty(prop)&&"function"===typeof eventsClass.prototype[prop]) {
                Synthetic[prop] = eventsClass.prototype[prop];
            }
        }
        eventsClass.call(Synthetic);
        /*
        * * * * * * * * * * * * * * * * * *
        */

        Synthetic.log = function() {
            //console.log.apply(console, (["%cSynthetic:","color:blue;font-style:italic;"]).concat(Array.prototype.slice.apply(arguments)));
        }

        Synthetic.$$angularBootstraped = false;

        /*
        Last factory
        */
        Synthetic.$$lastElementFactory = false;

        Synthetic.hasPropertySubKey = function(property, subkey) {
            if (!("string"===typeof property||property instanceof Array)) return false;
            return !!~("string"===typeof property?property.replace(' ','').split(','):property).indexOf(subkey);
        }

        Synthetic.createComponent = function(componentOptions, constructor) {

            var defaultOptions = {
                name: '',
                engine: 'sinthezia'
            };

            componentOptions = "string"!==typeof componentOptions ?
            mixin(defaultOptions, componentOptions) : mixin(defaultOptions, {
                name: componentOptions
            });

            if (componentOptions.name.indexOf("-") < 0) throw "Module name must have `-` symbol";

            var componentFactory = new ComponentPreFactory(componentOptions),
            prototype = smartCallback.call({
                $component: componentFactory
            }, constructor)();

            if ("object"===typeof prototype) {
                componentFactory.proto(prototype);
            } else if ("function"===typeof prototype) {
                componentFactory.construct(prototype);
            }

            document.registerElement(componentOptions.name, {
                prototype: Object.create(HTMLElement.prototype, {
                    createdCallback: {
                        value: function() {
                            

                            if (this.synthetic) return false;


                            var WebElementFactory = function(element, component) {

                                

                                Synthetic.$$lastElementFactory = this;

                                this.$element = element;

                                Object.defineProperty(this, '$scope', {
                                    get: function() {
                                        return this.__selfie__.$scope;
                                    }
                                })

                                Object.defineProperty(element, 'synthetic', {
                                    enumerable: false,
                                    writable: false,
                                    configurable: false,
                                    value: this
                                });

                                Object.defineProperty(this, '__config__', {
                                    enumerable: false,
                                    writable: false,
                                    configurable: true,
                                    value: mixin({
                                        allWaitingForResolve: false, // Используется при инициализации angular.
                                        // DOTO: delete depricated element
                                        generator: false, // Depricated
                                        $$angularScope: false, // Ссылка на $scope angular
                                        $$angularInitialedStage: 0, // Этап инициализации angular
                                        createdEventFires: false, // Произошло ли событие created
                                        attachedEventFires: false, // Произошло ли событие attached
                                        templateModulePrototype: false // Класс, которым автоматичнески расширяется модуль шаблона 
                                    }, component.options)
                                });

                                var $$scope= {
                                    attributes: {}, // Содержит все аттрибуты элемента
                                    properties: {}, // Содержит все аттрибуты data-*
                                    html: {},
                                    uid: 'syntheticElement'+Math.round(Math.random()*10000),
                                    test: {
                                        abc: 'helloworld'
                                    }
                                }

                                Object.defineProperty(this, '__selfie__', {
                                    enumerable: false,
                                    writable: false,
                                    configurable: true,
                                    value: {
                                        $scope: $$scope,
                                        $element: element,
                                        $self: this,
                                        $component: component,
                                        $generator: new Generator(this)
                                    }
                                });
                                /*
                                Если обнаружен angular, то мы создаем новое приложение для него
                                и размещаем контроллер на компоненте.
                                Имя приложения и контроллера создаются рандомно. Для каждого
                                нового экземпляра компонента создается свой экземпляр
                                приложения angular.
                                Имя приложения >> this.$$angularModuleName
                                Имя контроллера >> this.$$angularModuleName+'Controller'

                                Когда происходит инициализация экземпляр получается состояние
                                __config__.$$angularInitialedStage = 1 и 
                                __config__.allWaitingForResolve = 'angularResolved';

                                При этом все слушатели событий будут задержаны до 
                                инициализации $scope от angular, а произойдет это при 
                                attached.
                                Когда инициализация $scope от angular произойдет состояние
                                __config__.$$angularInitialedStage станет 2 и будет вызвано
                                событие 'angularResolved', все watchers пройдут инициализацию
                                */
                                if ("object"===typeof angular&&angular.bootstrap&&component.options.engine==='angular') {
                                    var $self = this;
                                    
                                    this.$$angularControllerName = 'singular'+(new Date()).getTime()+Math.round(Math.random()*10000);
                                     /*
                                    Set element angular integration stage
                                    */
                                    this.__config__.$$angularInitialedStage = 1;
                                    /*
                                    Set element waiting for `angularResolved` 
                                    */
                                    this.__config__.allWaitingForResolve = 'angularResolved';

                                    /* Creates angular app if not exists. Why i'm speaking english??? */
                                    
                                    if ("undefined"===typeof Synthetic.$$angularApp) {
                                        Synthetic.log('$$configure angular app');
                                       
                                        
                                        /*
                                        Creates new angular app
                                        */
                                        Synthetic.$$angularApp = angular.module('syntheticApp', [], function() {
                                                                                        
                                        }.bind(this));

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
                                        ).run(function($rootScope, $compile, $q) {
                                            Synthetic.$$angularRootScope = $rootScope;
                                            Synthetic.$$angularRCompile = $compile;
                                            Synthetic.$$angularQ = $q;
                                        });
                                        
                                        /*
                                        * * * * * * * * * * * * *
                                        *  Angular bootstraping * =================| 
                                        * * * * * * * * * * * * *
                                        */
                                        if ("object"!==typeof angular.element(document.body).injector()) {

                                            angular.element(document.body).ready(function() {
                                             
                                                    angular.bootstrap(document.body, 
                                                    ['syntheticApp']);
                                                    Synthetic.$$angularBootstraped = true;
                                                    
                                                    Synthetic.trigger('angularBootstraped');
                                              
                                            }.bind(this));
                                        }
                                    }

                                    var controllerGenerator = function() {
                                        /*
                                        Предотвращаем генерацию контроллера, если элемент уже был удален
                                        */
                                        if (this.$destroyed) return false;



                                        Synthetic.log('$$controller registred', $self.$$angularControllerName);
                                        var deferred = Synthetic.$$angularQ.defer();

                                        Synthetic.$$angularApp.controller(this.$$angularControllerName, 
                                            function ($element, $scope, $timeout, $compile) {
                                            
                                            /*
                                            Если элемент был перемещен в scope
                                            */
                                            if (angular.element($self.$element).scope()===undefined) {
                                                
                                                $self.$destroy();
                                                return;
                                            }
                                            
                                            Synthetic.log('$$controller initialed', $self.$$angularControllerName);
                                            
                                            angular.extend($scope, $$scope);
                                            
                                            $self.__selfie__.$scope = $scope;

                                            $self.__config__.$$angularInitialedStage = 2;
                                            $self.__config__.allWaitingForResolve = false;

                                            $self.__config__.$$angularScope = angular.element($self.__selfie__.$element).scope();
                                            $self.__config__.$$angularTimeout = $timeout;
                                            $self.__config__.$$angularCompile = $compile;
                                            $self.__config__.$$angularElement = $element;
                                            
                                            $self.trigger('angularResolved');
                                        });     
                                        
                                       

                                        element.setAttribute('ng-controller', $self.$$angularControllerName);
                                       
                                        /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
                                        * Этот код на вес золота, я его решал несколько дней. Его смысл прикрепить контроллер к синтету. *

                                        Посколько после того как angular проходит стадию bootstrap он перестается следить на деревом, к 
                                        которому он не относится, все вновь созданные компоненты должны быть инициализированны принудительно.
                                        За исключением тех случаев, когда шаблон для них устанавливается через интерфейс $generator.render()
                                        в таком случае angular сам производит инициализацию контроллеров.

                                        Мною было найдено несколько ресурсов, которые помогли мне решить задачу.

                                        http://ify.io/lazy-loading-in-angularjs/
                                        Здесь предлагают использовать $compileProvider. Это решение позволяет создавать новые контроллеры
                                        уже после активации angular.

                                        http://stackoverflow.com/a/24058760/5322348
                                        Здесь был продемонстрирован данный код. Он позволяет компилировать отдельные элементы, вводя их в
                                        область видимости angular.

                                        Morulus
                                        * * * * * * * *  * * * * * * * *  * * * * * * * *  * * * * * * * *  * * * * * * * *  * * * * * * */
                                        /*
                                                                                */
                                        setTimeout(function() {
                                            if ($self.__config__.$$angularInitialedStage>1) return;
                                            angular.element(document.body).injector().invoke(function($compile) { 
                                                var scope = angular.element(element).scope(); 
                                                if (!scope) {
                                                    /*
                                                    Если scope для этого элемента не проявляется, значит angular его использует как вспомогательный элемент,
                                                    инициализировать такой элемент нам не нужно.
                                                    */

                                                    $self.$destroy();
                                                } else {
                                                    /*
                                                    Воизбежание переиницаилизации мы должны игнорировать директиву
                                                    ngRepeat. Игнорирование прочих директив не исключено, то их поведение
                                                    еще не выявлено.
                                                    */                                                    
                                                    $compile(element, undefined, undefined, 'ngRepeat')(scope); 
                                                }
                                            });
                                        });
                                        /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */                   
                                       
                                        Object.defineProperty(this, '$$angular', {
                                            enumerable: false,
                                            writable: false,
                                            configurable: false,
                                            value: Synthetic.$$angularApp
                                        });           
                                       
                                        Object.defineProperty(this, '$$angular', {
                                            enumerable: false,
                                            writable: false,
                                            configurable: false,
                                            value: Synthetic.$$angularApp
                                        });
                                    }.bind(this);

                                    if (Synthetic.$$angularBootstraped) {
                                        controllerGenerator();
                                    } else {
                                        Synthetic.bind('angularBootstraped', controllerGenerator);
                                    }
                                }

                                /*
                                Собираем дерево элементов в $scope
                                */
                               
                                for (var i = 0;i<element.childNodes.length;++i) {
                                    if (element.childNodes[i].nodeType===1) {

                                        if (element.childNodes[i].tagName.toLowerCase()==='script'&&regSyntheticScript.test(element.childNodes[i].innerHTML)) {
                                           ;(function(content) {
                                               var userfunc,
                                               Synthetic = function(callback) {
                                                    userfunc = callback;
                                               }
                                               try {
                                                    eval(content);
                                               } catch(e) {
                                                    console.error('Syntehtic: user func corrupt;', content, e);
                                                    return;
                                               }

                                               this.$queue(this.$inject(userfunc));
                                           }).call(this, element.childNodes[i].innerHTML);
                                        } else {
                                            this.__selfie__.$scope.html[camelize(element.childNodes[i].tagName.toLowerCase())] = element.childNodes[i].innerHTML;
                                        }
                                    }
                                }
                                
                                /*
                                Культивируем аттрибуты
                                */
                                for (var z = 0; z < element.attributes.length; z++) {
                                    this.__selfie__.$scope.attributes[camelize(element.attributes[z].name)] = element.attributes[z].value;
                                    if (element.attributes[z].name.substr(0,5)==='data-')
                                    this.__selfie__.$scope.properties[camelize(element.attributes[z].name.substr(5))] = element.attributes[z].value;
                                }
                                
                                this.$queue(function() {

                                    /*
                                    Преобраузем пользователський прототип c внедрением селфи аргументов
                                    */
                                    for (var i = 0;i<component.prototypes.length;++i) {
                                        for (var p in component.prototypes[i]) {
                                            if (component.prototypes[i].hasOwnProperty(p)) {
                                                this[p] = this.$inject(component.prototypes[i][p]);
                                            }
                                        }
                                    }

                                    
                                    
                                    this.trigger("created", [ this.element ]);
                                    this.__config__.createdEventFires = true;

                                    /*
                                    Component conceived methods
                                    */
                                    for (var i = 0;i<component.conceivedCallers.length;++i) {
                                        this[component.conceivedCallers[i][0]].apply(this, component.conceivedCallers[i][1]);
                                    }

                                    /*
                                    Поочередно вызываем функции для события created (если created уже был)
                                    */
                                    if (this.__config__.createdEventFires) {
                                        
                                        
                                        for (var i = 0;i<component.onCreatedCallbacks.length;++i) {
                                            
                                            this.$inject(component.onCreatedCallbacks[i])();
                                        }
                                    } else {

                                        for (var i = 0;i<component.onCreatedCallbacks.length;++i) {

                                            this.on("created", component.onCreatedCallbacks[i]);
                                        }
                                    }

                                    /*
                                    Поочередно вызываем функции для события attached (если attached уже был)
                                    */
                                    if (this.__config__.attachedEventFires) {
                                        for (var i = 0;i<component.onAttachedCallbacks.length;++i) {
                                            this.$inject(component.onAttachedCallbacks[i])();
                                        }
                                    } else {
                                        for (var i = 0;i<component.onAttachedCallbacks.length;++i) {
                                            this.on("attached", component.onAttachedCallbacks[i]);
                                        }
                                    }
                                    
                                    /*
                                    Переносим callback для detached
                                    */
                                    for (var i = 0;i<component.onDetachedCallbacks.length;++i) {
                                        this.on("detached", component.onDetachedCallbacks[i]);
                                    }

                                    /*
                                    Переносим callback для detached
                                    */
                                    for (var i = 0;i<component.onAttributeChangedCallbacks.length;++i) {
                                        this.on("attributeChanged", component.onAttributeChangedCallbacks[i]);
                                    }

                                    /*
                                    Переносим наблюдение за scope
                                    */    

                                    for (var i = 0;i<component.watchers.length;++i) {
                                        this.watch.apply(this, component.watchers[i]);
                                    }


                                });

                            }.inherit(WebElementPrototype);

                            // inherit constructors
                            for (var i = 0;i<componentFactory.constructors.length;++i) {
                                WebElementFactory.inherit(componentFactory.constructors[i]);
                            }

                            WebElementFactory.inherit(WebElementPrototype);
                            var WebElement = new WebElementFactory(this, componentFactory);
                        }
                    },
                    attachedCallback: {
                        value: function() {
                            Synthetic.log(this.synthetic.__config__.$$angularInitialedStage);
                            if (this.synthetic.__config__.$$angularInitialedStage===1) {
                                /*
                                Angular bootstraping
                                */
                                 

                                    // To resove this faka staff, i found this 
                                    // view-source:http://bennadel.github.io/JavaScript-Demos/demos/loading-angularjs-after-bootstrap/
                                

                                //this.synthetic.__generateHtml__();
                            }
                            this.synthetic.trigger("attached", [ this.synthetic ]);
                            this.synthetic.__config__.attachedEventFires = true;
                        }
                    },
                    detachedCallback: {
                        value: function() {
                            
                            this.synthetic.trigger("detached", [ this.synthetic ]);
                        }
                    },
                    attributeChangedCallback: {
                        configurable: true,
                        writable: true,
                        enumerable: true,
                        value: function(name, previousValue, value) {
                            
                            if ("object"===typeof Synthetic.$$angularApp && this.synthetic.__config__.$$angularInitialedStage>1) {
                                if (previousValue !== value) {
                                    
                                    this.synthetic.__config__.$$angularTimeout(function() {
                                        angular.element(this.synthetic.__selfie__.$element).scope().$apply(function() {
                                            this.synthetic.__selfie__.$scope.attributes[camelize(name)] = value;
                                            if (name.substr(0,5)==='data-') {
                                               
                                                    this.synthetic.__selfie__.$scope.properties[camelize(name.substr(5))] = value;
                                               
                                            }
                                            this.synthetic.trigger("attributeChanged", [ this.synthetic, name, previousValue, value ]);
                                        }.bind(this));
                                    }.bind(this));                                    
                                }
                            } else {
                                if (previousValue !== value) {
                                    
                                    this.synthetic.__selfie__.$scope.attributes[camelize(name)] = value;
                                    if (name.substr(0,5)==='data-') {
                                       
                                            this.synthetic.__selfie__.$scope.properties[camelize(name.substr(5))] = value;
                                       
                                    }
                                    this.synthetic.trigger("attributeChanged", [ this.synthetic, name, previousValue, value ]);
                                }
                            }
                        }
                    }
                })
            });

            return componentFactory;
        }

        if (window) window.Synthet = window.Synthetic = Synthetic;
        return Synthet;

});