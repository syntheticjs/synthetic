/*
AMD Synthet
*/
(function(name, depends, factory) {
	if (define && "function"===typeof define) define(name, depends, factory);
	
})
("synthet", [
	"abstudio~mutagen@0.1.10",
	"abstudio~inherit@0.1.4",
	"./classEvents.js",
    "./WebElementPrototype.js",
    "./d3party/watchJS/watch.js",
	"polyvitamins~polychrome@master/gist/convert/camelize.js",
    "./smartCallback.js",
    "./preFactory.js",
    "polyvitamins~polyinherit@master",
	"./d3party/WebReflection/document-register-element.amd.js"
], function(mutagen, inherit, eventsClass, WebElementPrototype, WatchJS, camelize, smartCallback, ComponentPreFactory) {
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
                            
                            var WebElementFactory = function(element, component) {
                                
                                Object.defineProperty(element, 'synthetic', {
                                    enumerable: false,
                                    writable: false,
                                    configurable: false,
                                    value: this
                                });

                                this.operands = {
                                    $scope: {
                                        attributes: {}, // Содержит все аттрибуты элемента
                                        properties: {} // Содержит все аттрибуты data-*
                                    },
                                    $element: element,
                                    $self: this,
                                    $component: component
                                }
                                /*
                                Культивируем аттрибуты
                                */
                                for (var z = 0; z < element.attributes.length; z++) {
                                    this.operands.$scope.attributes[camelize(element.attributes[z].name)] = element.attributes[z].value;
                                    if (element.attributes[z].name.substr(0,5)==='data-')
                                    this.operands.$scope.properties[camelize(element.attributes[z].name.substr(5))] = element.attributes[z].value;
                                }
                                /*
                                Преобраузем пользователський прототип
                                */
                                for (var i = 0;i<component.prototypes.length;++i) {
                                    for (var p in component.prototypes[i]) {
                                        if (component.prototypes[i].hasOwnProperty(p)) {
                                            this.__proto__[p] = smartCallback.call(this.operands, component.prototypes[i][p]);
                                        }
                                    }
                                }

                                /*
                                Переносим callback для created
                                */
                                for (var i = 0;i<component.onCreatedCallbacks.length;++i) {

                                    this.on("created", component.onCreatedCallbacks[i]);
                                }

                                this.trigger("created", [ WebElement ]);

                                /*
                                Переносим наблюдение за аттрибутами
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
                            if (previousValue !== value) {
                                this.synthetic.operands.$scope.attributes[camelize(name)] = value;
                                if (name.substr(0,5)==='data-') {
                                    this.synthetic.operands.$scope.properties[camelize(name.substr(5))] = value;
                                }
                                this.synthetic.trigger("attributeChanged", [ this.synthetic, name, previousValue, value ]);
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