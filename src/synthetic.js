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
    "./WebElementPrototype.js",
    "./d3party/watchJS/watch.js",
	"polyvitamins~polychrome@master/gist/convert/camelize.js",
    "./smartCallback.js",
    "./preFactory.js",
    "polyvitamins~polyinherit@master",
	"./d3party/WebReflection/document-register-element.amd.js"
], function(mutagen, inherit, mixin, eventsClass, templateManager, WebElementPrototype, WatchJS, camelize, smartCallback, ComponentPreFactory) {
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
                                        angulared: false
                                    }
                                });

                                var $$scope= {
                                    attributes: {}, // Содержит все аттрибуты элемента
                                    properties: {}, // Содержит все аттрибуты data-*
                                    html: {} 
                                }
                                /*
                                Если обнаружен angular, то мы создаем новое приложение для него
                                */
                                Object.defineProperty(this, '__selfie__', {
                                    enumerable: false,
                                    writable: false,
                                    configurable: true,
                                    value: {
                                        $scope: $$scope,
                                        $element: element,
                                        $self: this,
                                        $component: component
                                    }
                                });

                                if (angular&&angular.bootstrap) {
                                    var $self = this;
                                    this.$$angularModuleName = 'singular'+(new Date()).getTime();
                                    var $$app = angular.module(this.$$angularModuleName, [])
                                    .controller(this.$$angularModuleName+'Controller', function ($scope) {
                                        
                                        $self.__config__.angulared = true;
                                        angular.extend($scope, $$scope);
                                        $self.__selfie__.$scope = $scope;

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

                                /*
                                Преобраузем пользователський прототип c внедрением селфи аргументов
                                */
                                for (var i = 0;i<component.prototypes.length;++i) {
                                    for (var p in component.prototypes[i]) {
                                        if (component.prototypes[i].hasOwnProperty(p)) {
                                            this.__proto__[p] = smartCallback.call(this.__selfie__, component.prototypes[i][p]);
                                        }
                                    }
                                }

                                /*
                                Переносим callback для created
                                */
                                for (var i = 0;i<component.onCreatedCallbacks.length;++i) {
                                    this.on("created", component.onCreatedCallbacks[i]);
                                }

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

                                this.__generateHtml__();

                                this.trigger("created", [ WebElement ]);

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
                            
                            /*
                            Переносим callback для attached
                            */
                            for (var i = 0;i<componentFactory.onAttachedCallbacks.length;++i) {
                                WebElement.on("attached", componentFactory.onAttachedCallbacks[i]);
                            }
                            /*
                            Переносим callback для detached
                            */
                            for (var i = 0;i<componentFactory.onDetachedCallbacks.length;++i) {
                                WebElement.on("detached", componentFactory.onDetachedCallbacks[i]);
                            }
                            /*
                            Переносим callback для detached
                            */
                            for (var i = 0;i<componentFactory.onAttributeChangedCallbacks.length;++i) {
                                WebElement.on("attributeChanged", componentFactory.onAttributeChangedCallbacks[i]);
                            }
                            
                        }
                    },
                    attachedCallback: {
                        value: function() {
                            
                            angular.element(this.synthetic.__selfie__.$element).ready(function() {
                              angular.bootstrap(this.synthetic.__selfie__.$element, [this.synthetic.$$angularModuleName]);
                            }.bind(this));
                            this.synthetic.__generateHtml__();
                            this.synthetic.trigger("attached", [ this.synthetic ]);
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
                                        this.synthetic.trigger("attributeChanged", [ this.synthetic, name, previousValue, value ]);
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

        if (window) window.Synthet = window.Synthetic = Synthet;
        return Synthet;

});