/*
AMD Synthet
*/
(function(name, depends, factory) {
	if (define && "function"===typeof define) define(name, depends, factory);
	
})
("synthet", [
	"abstudio~mutagen@0.1.10",
	"abstudio~inherit@0.1.4",
	"abstudio~classEvents@0.1.0",
	"polyvitamins~polychrome@master/gist/convert/camelize.js",
	"./d3party/WebReflection/document-register-element.amd.js"
], function(mutagen, inherit, eventsClass, camelize) {
	var customeElement = inherit(function(element, component) {
            this.$ = element;
            this.component = component;
            this.attributes = {};
            this.cultAttrs();
        }, eventsClass);
        customeElement.prototype.query = function(queryString) {
            var nodeList = mutagen.query(queryString, this.$);
            if (nodeList instanceof NodeList || nodeList instanceof Array) {
                return Array.prototype.slice.apply(nodeList);
            } else {
                return [];
            }
        }
        customeElement.prototype.cultAttrs = function() {
           this.attributes = {};
            this.properties = {};
            for (var z = 0; z < this.$.attributes.length; z++) {
                this.attributes[camelize(this.$.attributes[z].name)] = this.$.attributes[z].value;
                if (this.$.attributes[z].name.substr(0,5)==='data-')
                this.properties[this.$.attributes[z].name.substr(5)] = this.$.attributes[z].value;
            }
        }
        var Module = inherit(function(name) {
            this.name = name;
            this._template = "";
            this.elementPrototype = {};
        }, eventsClass);
        /* Depricated method */
        Module.prototype.setTemplate = function(template) {
            this._template = template;
            this.on("created", function(module) {
                if (this._template!==false)
                mutagen.call(this._template, module.$);
            });
        };
        /*
        Set/get template
        */
        Module.prototype.template = function(template, defaultPlaceholders) {
            this._template = [template, defaultPlaceholders||{}];
            this.on("created", function(module) {
                mutagen.call(this._template[0], module.$, function(replacings) {
                    for (var prop in defaultPlaceholders) {
                        if (defaultPlaceholders.hasOwnProperty(prop)) replacings['{{'+prop+'}}'] = defaultPlaceholders[prop];
                    }
                });
            });
            return this;
        };
        Module.prototype.setElementPrototype = function(proto) {
            this.elementPrototype = proto;
        };
        Module.prototype.register = function() {
            var component = this;
            document.registerElement(this.name, {
                prototype: Object.create(HTMLElement.prototype, {
                    createdCallback: {
                        value: function() {
                            var WebModule = function() {};
                            WebModule.prototype = component.elementPrototype;
                            WebModule.prototype.constructor = WebModule;
                            WebModule = inherit(WebModule, customeElement);
                            var ce = new WebModule(this, component);
                            
                            Object.defineProperty(this, 'synthetic', {
                                enumerable: false,
                                writable: false,
                                configurable: false,
                                value: ce
                            })
                            
                            component.trigger("created", [ ce ]);
                        }
                    },
                    attachedCallback: {
                        value: function() {
                            component.trigger("attached", [ this.synthetic ]);
                        }
                    },
                    detachedCallback: {
                        value: function() {
                            component.trigger("detached", [ this.synthetic ]);
                        }
                    },
                    attributeChangedCallback: {
                        configurable: true,
                        writable: true,
                        enumerable: true,
                        value: function(name, previousValue, value) {
                            if (previousValue !== value) {
                                this.synthetic.attributes[camelize(name)] = value;
                                if (name.substr(0,5)==='data-') {
                                    this.synthetic.properties[camelize(name.substr(5))] = value;
                                }
                                component.trigger("attributeChanged", [ this.synthetic, name, previousValue, value ]);
                            }
                        }
                    }
                })
            });
        };
        var Synthet = function(element) {
            if ("object"!==typeof element.synthetic) {
                return null;
            }
            return element.synthetic;
        };
        Synthet.prototype = {
            construct: Synthet
        };
        Synthet.newComponent = function(name, template, elementPrototype) {
            if (name.indexOf("-") < 0) throw "Module name must have `-` symbol";
            var component = new Module(name);
            component.setTemplate(template);
            component.setElementPrototype(elementPrototype || {});
            return component;
        };

        if (window) window.Synthet = Synthet;
        return Synthet;

});