/*
AMD Synthet
*/
(function(name, depends, factory) {
	if (define && "function"===typeof define) define(name, depends, factory);

})
("synthet", [
	"abstudio~mutagen@0.1.10",
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
], function(mutagen, inherit, mixin, eventsClass, templateManager, GeneratorClass, WebElementPrototype, WatchJS, camelize, smartCallback, ComponentPreFactory) {
        var Synthet = function(element) {
            if ("object"!==typeof element.synthetic) {
                return null;
            }
            return element.synthetic;
        };

        Synthet.prototype = {
            construct: Synthet
        };

        Synthet.hasPropertySubKey = function(property, subkey) {
            if (!("string"===typeof property||property instanceof Array)) return false;
            return !!~("string"===typeof property?property.replace(' ','').split(','):property).indexOf(subkey);
        }

        Synthet.createComponent = function(componentName, constructor) {
            if (componentName.indexOf("-") < 0) throw "Module name must have `-` symbol";

            var componentFactory = new ComponentPreFactory({
                constructor: constructor
            }),
            prototype = smartCallback.call({
                $component: componentFactory
            }, constructor)();

            if ("object"===typeof prototype) {
                componentFactory.proto(prototype);
            } else if ("function"===typeof prototype) {
                componentFactory.construct(prototype);
            }



            document.registerElement(componentName, {
                prototype: Object.create(HTMLElement.prototype, {
                    createdCallback: {
                        value: function() {
                            if (this.synthetic) return false;
                            
                            var WebElementFactory = function(element, component) {

                                Object.defineProperty(this, '$element', {
                                    enumerable: false,
                                    writable: false,
                                    configurable: false,
                                    value: element
                                });

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
                                    value: {
                                        generator: false,
                                        angulared: false,
                                        allWaitingForResolve: false,
                                        $$angularScope: false,
                                        createdEventFires: false,
                                        attachedEventFires: false
                                    }
                                });

                                var $$scope= {
                                    attributes: {}, // Содержит все аттрибуты элемента
                                    properties: {}, // Содержит все аттрибуты data-*
                                    html: {} 
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
                                        $generator: new GeneratorClass(this),
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
                                __config__.angularInitialedStage = 1 и 
                                __config__.allWaitingForResolve = 'angularResolved';

                                При этом все слушатели событий будут задержаны до 
                                инициализации $scope от angular, а произойдет это при 
                                attached.
                                Когда инициализация $scope от angular произойдет состояние
                                __config__.angularInitialedStage станет 2 и будет вызвано
                                событие 'angularResolved', все watchers пройдут инициализацию
                                */


                                if (angular&&angular.bootstrap) {

                                    var $self = this;
                                    this.__config__.angularInitialedStage = 1;
                                    this.__config__.allWaitingForResolve = 'angularResolved';
                                    this.$$angularModuleName = 'singular'+(new Date()).getTime();
                                    var $$app = angular.module(this.$$angularModuleName, [])
                                    .controller(this.$$angularModuleName+'Controller', function ($element, $scope, $timeout, $compile, $element) {

                                        
                                        $self.__config__.angulared = true;
                                        angular.extend($scope, $$scope);
                                        $self.__selfie__.$scope = $scope;

                                        $self.__config__.angularInitialedStage = 2;
                                        $self.__config__.allWaitingForResolve = false;
                                        

                                        $self.__config__.$$angularScope = angular.element($self.__selfie__.$element).scope();
                                        $self.__config__.$$angularTimeout = $timeout;
                                        $self.__config__.$$angularCompile = $compile;
                                        $self.__config__.$$angularElement = $element;

                                        $self.trigger('angularResolved');
                                    });
                                    element.setAttribute('ng-controller', this.$$angularModuleName+'Controller');
                                   
                                    Object.defineProperty(this, '$$angular', {
                                        enumerable: false,
                                        writable: false,
                                        configurable: false,
                                        value: $$app
                                    });
                                }

                                /*
                                Собираем дерево элементов в $scope
                                */
                                for (var i = 0;i<element.childNodes.length;++i) {
                                    if (element.childNodes[i].nodeType===1) {
                                        this.__selfie__.$scope.html[camelize(element.childNodes[i].tagName.toLowerCase())] = element.childNodes[i].innerHTML;
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
                                    Переносим callback для attributeChanged
                                    */
                                    for (var i = 0;i<component.onAttributeChangedCallbacks.length;++i) {
                                        this.on("attributeChanged", component.onAttributeChangedCallbacks[i]);
                                    }
                                });

                                /*
                                Проверяем наличие генератора
                                */
                                if ("object"===typeof component.generator) {
                                    this.__config__.generator = mixin({
                                        "template": "",
                                        "engine": "min",
                                        "buildOn": ["create"]
                                    }, component.generator);
                                }

                                this.trigger("created", [ WebElement ]);
                                this.__config__.createdEventFires = true;

                                /*
                                Переносим наблюдение за scope
                                */                                
                                for (var i = 0;i<component.watchers.length;++i) {
                                    this.watch.apply(this, component.watchers[i]);
                                }

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
                            if (this.synthetic.__config__.angularInitialedStage===1) {
                                /*
                                Бутстрапинг для angularjs. При бутстрапинге angular
                                состояние __config__.angularInitialedStage принимает значение 2,
                                и вызывается событие anglarResolved, которое слушают все задержанные методы.
                                
                                Состояние __config__.allWaitingForResolve диактивируется.
                                */
                                angular.element(this.synthetic.__selfie__.$element).ready(function() {
                                  angular.bootstrap(this.synthetic.__selfie__.$element, [this.synthetic.$$angularModuleName]);
                                }.bind(this));
                                

                                this.synthetic.__generateHtml__();
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
                            
                            if (this.synthetic.__config__.angulared) {
                                if (previousValue !== value) {
                                    angular.element(this.synthetic.__selfie__.$element).scope().$apply(function() {
                                        this.synthetic.__selfie__.$scope.attributes[camelize(name)] = value;
                                        if (name.substr(0,5)==='data-') {
                                           
                                                this.synthetic.__selfie__.$scope.properties[camelize(name.substr(5))] = value;
                                           
                                        }

                                    }.bind(this));
                                }
                            } else {
                                if (previousValue !== value) {
                                    
                                    this.synthetic.__selfie__.$scope.attributes[camelize(name)] = value;
                                    if (name.substr(0,5)==='data-') {
                                       
                                            this.synthetic.__selfie__.$scope.properties[camelize(name.substr(5))] = value;
                                       
                                    }

                                }
                            }
                            this.synthetic.trigger("attributeChanged", [ name, previousValue, value ]);
                        }
                    }
                })
            });

            return componentFactory;
        }

        if (window) window.Synthet = window.Synthetic = Synthet;
        return Synthet;

});