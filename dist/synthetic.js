/*!
 * The MIT License (MIT)
 * 
 * Copyright (c) 2015-2016 Vladimir Kalmykov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["synthetic"] = factory();
	else
		root["synthetic"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var inherit = __webpack_require__(1);
	var mixin = __webpack_require__(2);
	var eventsClass = __webpack_require__(3);
	var camelize = __webpack_require__(5);
	var smartCallback = __webpack_require__(4);
	var ComponentPreFactory = __webpack_require__(6);
	var initAngular = __webpack_require__(17);
	var scopeGenerator = __webpack_require__(18);
	var WebElementFactory = __webpack_require__(20);
	var Creed = __webpack_require__(7).Creed;
	__webpack_require__(16);
	__webpack_require__(30);

	function getRandomColor() {
	    var letters = '0123456789ABCDEF'.split('');
	    var color = '#';
	    for (var i = 0; i < 6; i++ ) {
	        color += letters[Math.floor(Math.random() * 16)];
	    }
	    return color;
	}
	/*
	Функция направлена на полное дублирование proto в target без
	связей
	*/
	var startextend = function(target, proto) {
	    for (var prop in proto) {
	        if (proto.hasOwnProperty(prop)) {
	            if ("object"===typeof proto[prop]) {
	                target[prop] = proto[prop] instanceof Array ? [] : {};
	                startextend(target[prop], proto[prop]);
	            } else {
	                target[prop] = proto[prop];
	            }
	        }
	    }
	}

	var componentAttacher = function() {
	    var self = this;
	    /*
	    Позволяет скрывать элемент до полной инициализации
	    */
	    if (this.synthetic.__config__.$$angularInitialedStage>1 && !Synthetic.$$angularBootstraped) {
	        
	        this.synthetic.$element.style.visibility = 'hidden';
	        Synthetic.bind('angularBootstraped', function() {
	               self.synthetic.$element.style.visibility = '';
	            }, true);
	    }

	    // Search parent synthetic element
	    if (!this.synthetic.__config__.permanent) {
	        /*
	        Только если отключена опция permanent мы меняем информацию о старшем компоненте
	        В режиме permanent объект должен всегда находится в изначальном состоянии,
	        даже если был был перемещен
	        */
	        var pe = this.synthetic.$element.parentNode;

	        while (!(pe === null || "undefined" !== typeof pe.synthetic)) {
	            pe = pe.parentNode
	        }

	        /*
	        Удаляем себя из предыдущего $parent
	        */
	        if (this.synthetic.$parent) {
	            this.synthetic.$parent.$$unRegisterChild(this.synthetic);
	        }

	        this.synthetic.$parent = (pe !== null && "object" === typeof pe.synthetic) ? pe.synthetic : false;


	        /*
	        Регистрируем себя в parentComponent
	        */
	        if (this.synthetic.$parent) {
	            this.synthetic.$parent.$$registerChild(this.synthetic);
	            this.synthetic.trigger('parentDefined');
	        }

	        /*
	        Делаем повторную инициализацию template, в случае если он уже существует.
	        Поскольку angular вместо удаления элементов просто помещает их в documentFragment
	        не будут работать дестроеры для модулей. 
	        Поэтому дестроеры теперь срабатывают при detach элементов, так же как повторная
	        инициализация при attach элементов здесь.
	        */
	        if (this.synthetic.$generator.configuration.module) {
	            this.synthetic.$generator.moduleReinit();
	        }
	    }

	    // Fires event
	    this.synthetic.trigger("attached", [ this.synthetic ]);
	    this.synthetic.__config__.attachedEventFires = true;
	}
	var componentCreater = function(componentFactory) {
	    /*
	    Отклоняем, если по какой то причине этот компонент уже инициализирован.
	    Так же по непонятным причинам компонент дублируется из размещения в DOM,
	    в этом случае мы так же должны его игнорировать.
	    TODO: выяснить причину дублирования
	    */

	    if (this.synthetic) return false;
	    
	    // inherit constructors
	    /*
	    TODO: Is this really deprecated?
	    DEPRECATED
	    for (var i = 0;i<componentFactory.constructors.length;++i) {
	        WebElementFactory.inherit(componentFactory.constructors[i]);
	    }
	    */
	   
	    var WebElement = new WebElementFactory(this, componentFactory);
	};

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
	Находит компонент в состав которого входит данный элемент
	*/
	Synthetic.search = function(element) {
	    while (element!==null && "object"!==typeof element.synthetic) {
	        element = element.parentNode;
	    }
	    return (element!==null && element.synthetic) ? element.synthetic : false;
	}

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


	Synthetic.components = {};

	Synthetic.log = function() {
	    //console.log.apply(console, (["%cSynthetic:","color:blue;font-style:italic;"]).concat(Array.prototype.slice.apply(arguments)));
	}

	Synthetic.$$angularBootstraped = false;

	/*
	Last factory
	*/
	Synthetic.$$lastElementFactory = false;

	/*
	Default config
	*/
	Synthetic.config = {
	    undefinedAttributeDefaultValue: undefined,
	    viewChangeListeners: []
	};

	Synthetic.hasPropertySubKey = function(property, subkey) {
	    if (!("string"===typeof property||property instanceof Array)) return false;
	    return !!~("string"===typeof property?property.replace(' ','').split(','):property).indexOf(subkey);
	}

	Synthetic.createComponent = function(componentOptions, workshop) {

	    var name = '', engine = {
	        name: 'synthetic',
	        initial: false
	    }, scope = false, HTMLElementPrototype = "HTMLElement";

	    /*
	    Преобразуем строковое представление componentOptions в объект
	    */
	    if ("string"!==typeof componentOptions) {
	        // Import name 
	        if (componentOptions.name) name = componentOptions.name;
	        // Import engine options
	        if ("string"===typeof componentOptions.engine) {
	            engine = {
	                name: componentOptions.engine,
	                initial: false
	            }
	        } else if ("object"===typeof componentOptions.engine&&componentOptions.engine instanceof Array) {
	            engine = {
	                name: componentOptions.engine[0],
	                initial: componentOptions.engine[1]||false
	            }
	        }
	        // Import default scopr
	        if ("object"===typeof componentOptions.scope) {
	            scope = componentOptions.scope;
	        }
	        //
	        if ("string"===typeof componentOptions.HTMLElementPrototype)
	            HTMLElementPrototype = componentOptions.HTMLElementPrototype;
	    } else {
	        name = componentOptions;
	    }

	    /* Validate name */
	    if (name.indexOf("-") < 0) throw "Module name must have `-` symbol";
	    
	    /*
	    Create component
	    */
	    var componentFactory = new ComponentPreFactory({
	        name: name, // Component name
	        engine: engine // Component engine
	    });

	    /*
	    Create default preset
	    */
	    var preset = componentFactory.createPreset('@');
	    /*
	    Import scope
	    */
	    if (scope) preset.$scope(scope);
	    /*
	    Import general workshop
	    */
	    preset.$run(workshop);

	    /*
	    Если мы используем angular, то помимо копонента мы создаем минимальную директиву,
	    задача которой будет создавать изолированный scope для каждого компонента
	    */
	    if (engine.name==='angular') {
	        /* Creates angular app if not exists. Why i'm speaking english??? */
	        if ("undefined"===typeof Synthetic.$$angularApp) {
	            initAngular();
	        }
	        
	        if ("function"===typeof componentFactory.engine.initial) {
	            componentFactory.engine.initial(Synthetic.$$angularApp);
	        }

	        /*
	        Creating angular directive
	        */
	        Synthetic.$$angularApp.directive(camelize(name), function() {
	            return {
	                restrict: 'E',
	                priority: 998,
	                scope: true,
	                compile: function($element, $rscope, $a, $controllersBoundTransclude) {

	                    // Запоминаем стартовое значение html
	                    var $defaultHtml = $element[0].innerHTML;

	                    // If element already initialized change angular directived status to true
	                    if (Synthetic($element[0])) {
	                        Synthetic($element[0]).__config__.$$angularDirectived = true;
	                    } else {
	                        /*
	                        If web-component still unitialized, initialize it by the force
	                        */
	                        componentCreater.call($element[0], componentFactory);
	                    }

	                    
	                    return {
	                        pre: function($scope, $element) {
	                            /*
	                            Элемент не может быть обработан директивой, если он не синтезирован
	                            */
	                            if (!Synthetic($element[0])) return;

	                            Synthetic($element[0]).__config__.$$angularDirectived = true;
	                            /*
	                            В данной ситуации пришлось отказаться от использования extend для
	                            создания дефолтного значения scope на основе предустановок;
	                            Странно, но даже при использовании extend, который является близкой копией extend
	                            из jQuery, некоторые свойства источника передаются по ссылке, а не копируются, что 
	                            приводит к катастрофическим ошибкам, связанным с записью данных в источник.

	                            Функция startextend гарантирует, что все копируемые свойства будут перевоссозданы заново,
	                            однако эта функция не осуществляет mixin с существующими значениями $scope, поэтому ее можно
	                            использовать только при первичной инициализации.

	                            Желательно выяснить по какой причине extend не создает требуемых копий свойств.
	                            */
	                            startextend($scope, componentFactory.presets['@'].$import.scope);
	                            
	                            /*
	                            Кастомизируем scope
	                            */
	                            scopeGenerator($element[0].synthetic, $scope);
	                        },
	                        post: function($scope, $element) {
	                            if (!Synthetic($element[0])) return;
	                            /*
	                            Инициализация директивы полностью завершена и мы можем перейти к 
	                            этапу 3
	                            */
	                            Synthetic($element[0]).__config__.$$angularInitialedStage = 3;
	                        }
	                    }
	                }
	            }
	        });
	    };

	    /*
	    Начинаем работу с кастомизацией элемента
	    */
	    var prototype = window[HTMLElementPrototype].prototype;
	    var elementOptions = {
	        prototype: Object.create(prototype, {
	            createdCallback: {
	                value: function() {
	                    componentCreater.call(this, componentFactory, this.innerHTML);
	                }
	            },
	            attachedCallback: {
	                value: function() {
	                    
	                    if (this.synthetic.__config__.allWaitingForResolve==='attached')
	                        this.synthetic.__config__.allWaitingForResolve = false;
	                    componentAttacher.call(this);                           
	                }
	            },
	            detachedCallback: {
	                value: function() {
	                    if (this.synthetic.$destroyed) return false;
	                    this.synthetic.__config__.allWaitingForResolve = 'attached';
	                    this.synthetic.__config__.attachedEventFires = false;
	                    this.synthetic.trigger("detached", [ this.synthetic ]);
	                    this.synthetic.$detach();
	                }
	            },
	            attributeChangedCallback: {
	                configurable: true,
	                writable: true,
	                enumerable: true,
	                value: function(name, previousValue, value) {

	                    var camelized = camelize(name);
	                    /*
	                    Для разгрузки производительности мы просматриваем лишь те аттрибуты, за которыми 
	                    мы наблюдаем
	                    */

	                    if (this.synthetic.$$attrsWatchers[camelized]) {

	                        /*
	                        Останавливаем отслеживание аттрибутов, если компонент удален или в процессе 
	                        удаления
	                        */
	                        if (this.synthetic.destoryed) return false;
	                        /*
	                        В случае если компонент работает через angular, запись будет производит в $$angularScope
	                        */
	                        if (Synthetic.$$angularApp && this.synthetic.__config__.$$angularInitialedStage>1) {
	                            if (previousValue !== value) {
	                                    // Использование Apply portion позволяет
	                                    // применить комбо изменений в scope 
	                                    var $self = this.synthetic;
	                                    // Присваиваем значение аттрибутов сейчас, но apply вызываем
	                                    // позже. Это снизит нагрузку
	                                    $self.$digest(function() {
	                                        
	                                        $self.$scope.attributes[camelized] = value;
	                                        
	                                        if (name.substr(0,5)==='data-') {
	                                                $self.$scope.properties[camelize(name.substr(5))] = value;
	                                        }

	                                        if ($self.$$attrsWatchers[camelized]) {
	                                            if ($self.__config__.attachedEventFires) {
	                                                
	                                                for (var i = 0;i<$self.$$attrsWatchers[camelized].length;++i) {
	                                                        

	                                                        $self.$$attrsWatchers[camelized][i].call($self, false, 'set', value);
	                                                   
	                                                }
	                                            }
	                                        }
	                                    });                                                               
	                            }
	                        } else {
	                            if (previousValue !== value) {
	                                this.synthetic.$scope.attributes[camelize(name)] = value;
	                                if (name.substr(0,5)==='data-') {
	                                   
	                                        this.synthetic.$scope.properties[camelize(name.substr(5))] = value;
	                                   
	                                }
	                            }
	                        }
	                    }
	                }
	            }
	        })
	    };

	    // ??????
	    //if (componentOptions.extends) elementOptions.extends = componentOptions.extends;

	    document.registerElement(name, elementOptions);
	    Synthetic.components[name] = componentFactory;
	    return componentFactory;
	}

	Synthetic.getComponent = function(name) {
	    if ("object"===typeof Synthetic.components[name])
	    return Synthetic.components[name];
	    else return new Creed(function(resolve, reject) { reject('Component not found'); });
	};

	if ("object"===typeof window) window['Synthetic']=Synthetic;
	module.exports = Synthetic;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {var mixin = __webpack_require__(2);

		/*
		Функция наследования одним классом другого. Расширяет прототип и конструктор. 
		Не требует ручного вызова конструктора родительских классов.
		*/
		module.exports = function(aClass, classes) {

			if (!(classes instanceof Array)) classes = [classes];
			var cl=classes.length;
			
			var superconstructor = function(){
				 var args = Array.prototype.slice.apply(arguments);
	            /*
				Поскольку в процессе построения экземпляра будут выполняться функции конструкторы всех наследуемых
				классов, нам необходимо запоминать тех, которые уже были вызваны, во избежании повторного вызова.
				*/
				if ("object"!==typeof this.constructors) Object.defineProperty(this, 'constructors', {
	                configurable: false,
	                enumerable: false,
	                writable: false,
	                value: []
	            });
	               
				for (var i=0;i<cl;++i) {

					/*
					Мы должны помнить какие конструкторы уже были выполнены для этого объект.
					Поэтому всю историю конструкторов необходимо хранить в прототипе,
					во избежании повторного его вызова. Так как мы можем наследовать классы,
					которые происходят от одного предка. В это случае конструктор предка будет
					вызван несколько раз, чего не требуется.
					*/


					if (this.constructors.indexOf(classes[i])>=0) continue;
					this.constructors.push(classes[i]);

					classes[i].apply(this, args);
				}
			},
			superprototype = superconstructor.prototype = {};

			/*
			Первым делом мы должны позаботиться о том, что если у расширяемого класса уже есть __super__ прототип,
			он должен быть перенесен в новый superprototype.
			*/
			if (aClass.prototype&&aClass.prototype!==null&&aClass.prototype.__super__) mixin(superprototype, aClass.prototype.__super__);
			/*
			Мы должны миксировать данный суперпрототип с прототипами всех наследуемых классов,
			а так же с их суперпрототипами. Так как в их прототипе содержатся собственные методы класса,
			а в __super__ миксины тех классов, которые они, возможно наследовали.
			*/
			for (var i=0;i<cl;++i) {
				if (classes[i].prototype) {
					if (classes[i].prototype.__super__) superprototype = mixin(superprototype, classes[i].prototype.__super__);
					superprototype = mixin(superprototype, classes[i].prototype);
				}
			}

			/*
			Мы связывает суперпрототип с суперконструктором.
			*/
			superprototype.constructor = superconstructor;

			/*
			Польскольку мы не можем взять и подменить тело функции у существующей функции,
			нам придется подменить орегинальную функцию на собственную. 
			*/
			var Mixin = function() {

				/*
				Если в прототипе класса вдруг возникла переменная __disableContructor__, значит кто то 
				не хочет, что бы при создании экземпляра класса происходил вызов конструкторов.
				Это может применять в методе construct абстрактного прототипа Function, для вызова
				контруктора через функцию Apply.
				*/
				if (this.constructor && this.constructor.__disableContructor__) {
					this.constructor.__disableContructor__ = false;
					return false;
				}

				var args = Array.prototype.slice.apply(arguments);

				/*
				Мы выполняем расширенные функции только если мы являемся экземпляром Mixin
				*/			
				
				if (! ("object"==typeof window&&(this===window)||"object"==typeof global&&(this===global) )) {
					superconstructor.apply(this, args)
				}

				aClass.apply(this, args);
			}
			Mixin.prototype = Object.create(superprototype, {
				
				/*
				Для быстрого кроссбраузерного доступа к суперпроототипу будет использоваться свойство __super__
				*/
				__super__: {
					configurable: false,
					enumerable: false,
					writable: false,
					value: superprototype
				}
			});
			/*
			Все свойства и методы из старого прототипа мы переносим в новый. Нам необходимо сделать так,
			что бы новый класс ничем не отличался от старого, кроме нового суперпрототипа.
			*/
			if (aClass.prototype) mixin(Mixin.prototype, aClass.prototype);
			/*
			Кроме того, все статичные свойства так же должны быть скопированы
			*/
			for (var prop in aClass) {
				if (aClass.hasOwnProperty(prop)) Mixin[prop] = aClass[prop];
			}
			Object.defineProperty(Mixin.prototype, "constructor", {
				configurable: false,
				enumerable: false,
				writable: false,
				value: Mixin
			});
			/*
			Если браузер не поддерживает __proto__, то мы создадим его, хотя он будет
			являться нечто иным, чем оригинальный __proto__, так как __proto__.__proto__
			не вернет прототип прототипа. 
			*/
			if (!Mixin.prototype.__proto__) {
				Mixin.prototype.__proto__ = Mixin.prototype;
			}

			return Mixin;
		}
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 2 */
/***/ function(module, exports) {

	
		var mixinup = function(a,b) { 
			for(var i in b) { 
				
				if (b.hasOwnProperty(i)) { 
		          	
					a[i]=b[i]; 
				} 
			} 
			return a; 
		};

		/*
		Функция слияние двух объектов. Объекты копируются по ссылке, поэтому любые изменения в одном объекте,
		приведут к изменениям во втором.
		Использование:
		mixin(foo, bar1, bar2, bar3 .. barN);
		*/
		module.exports = function(a) { 
			var i=1; 
			for (;i<arguments.length;i++) { 
				if ("object"===typeof arguments[i]) {

					mixinup(a,arguments[i]); 
				} 
			} 
			return a;
		}

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	
	    var smartCallback = __webpack_require__(4);

		var Events = function() {
			 Object.defineProperties(this, {
	            eventListners: {
	                enumerable: false,
	                writable: false,
	                configurable: false,
	                value: {}
	            },
	            bubblingListners: {
	                enumerable: false,
	                writable: false,
	                configurable: false,
	                value: {}
	            },
	            surfacingListners: {
	                enumerable: false,
	                writable: false,
	                configurable: false,
	                value: {}
	            },
	            eventTracks: {
	                enumerable: false,
	                writable: false,
	                configurable: false,
	                value: {}
	            }
	        });
		}

	    /*
	    eventListner
	    */
		var eventListner = function(own, event, i) {
			this.owner = own;
			this.event = event;
			this.index = i;
		}
		eventListner.prototype = {
			constructor: eventListner,
			destroy: function() {
				this.owner.eventListners[this.event][this.index] = null;
				this.owner = null;
				this.event = null;
				this.index = null;
			}
		};

	    /*
	    BubblingListner
	    */
	    var bubblingListner = function(own, event, i) {
	        this.owner = own;
	        this.event = event;
	        this.index = i;
	    }
	    bubblingListner.prototype = {
	        constructor: bubblingListner,
	        destroy: function() {
	            this.owner.bubblingListners[this.event][this.index] = null;
	            this.owner = null;
	            this.event = null;
	            this.index = null;
	        }
	    };

	    /*
	    surfacingListner
	    */
	    var surfacingListner = function(own, event, i) {
	        this.owner = own;
	        this.event = event;
	        this.index = i;
	    }
	    surfacingListner.prototype = {
	        constructor: surfacingListner,
	        destroy: function() {
	            this.owner.surfacingListners[this.event][this.index] = null;
	            this.owner = null;
	            this.event = null;
	            this.index = null;
	        }
	    };


		Events.prototype = {
			constructor: Events,
	        capture: function(e, callback, once) {
	            if (typeof this.surfacingListners[e] != 'object') this.surfacingListners[e] = [];

	            this.surfacingListners[e].push({
	                callback: callback,
	                once: once||false
	            });

	            /*
	            Call callback if event already fired
	            */
	            return new surfacingListner(this, e, this.surfacingListners[e].length-1);
	        },
	        uncapture: function(e, handler) {
	            if (this.surfacingListners[e]) {
	                if ("undefined"===typeof handler) delete this.surfacingListners[e];
	                else
	                    for (var i = 0; i < this.surfacingListners[e].length; ++i) {
	                        if (this.surfacingListners[e][i]&&this.surfacingListners[e][i].callback===handler) this.surfacingListners[e][i] = null;
	                    }
	            }
	            return this;
	        },
	        surface: function() {
	          this.plunge.apply(this, arguments);
	        },
	        plunge: function(e, args) {
	            var response = null;
	            if (typeof this.surfacingListners[e] == 'object' && this.surfacingListners[e].length>0) {
	                var todelete = [];
	                for (var i = 0; i<this.surfacingListners[e].length; i++) {
	                    if (this.surfacingListners[e][i]!==null) {
	                        if (typeof this.surfacingListners[e][i].callback === "function") response = this.surfacingListners[e][i].callback.apply(this, args);

	                        if (this.surfacingListners[e][i].once) {

	                            todelete.push(i);
	                        };
	                        if (response===false) { return response; }
	                    };
	                };

	                if (todelete.length>0) for (var i in todelete) {
	                    this.surfacingListners[e][todelete[i]] = null;
	                };
	            };

	            // Surface it
	            if (this.$childs) {
	                for (var i = 0;i<this.$childs.length;++i) {
	                    this.$childs[i].surface(e, args);
	                }
	            }

	            return response;
	        },
	        sense: function(e, callback, once) {
	            if (typeof this.bubblingListners[e] != 'object') this.bubblingListners[e] = [];

	            this.bubblingListners[e].push({
	                callback: callback,
	                once: once||false
	            });

	            /*
	            Call callback if event already fired
	            */
	            return new bubblingListner(this, e, this.bubblingListners[e].length-1);
	        },
	        unsense: function(e, handler) {
	            if (this.bubblingListners[e]) {
	                if ("undefined"===typeof handler) delete this.bubblingListners[e];
	                else
	                for (var i = 0; i < this.bubblingListners[e].length; ++i) {
	                    if (this.bubblingListners[e][i]&&this.bubblingListners[e][i].callback===handler) this.bubblingListners[e][i] = null;
	                }
	            }
	            return this;
	        },
	        bubbling: function(e, args) {
	            var response = null;
	            if (typeof this.bubblingListners[e] == 'object' && this.bubblingListners[e].length>0) {
	                var todelete = [];
	                for (var i = 0; i<this.bubblingListners[e].length; i++) {
	                    if (this.bubblingListners[e][i]!==null) {
	                        if (typeof this.bubblingListners[e][i].callback === "function") response = this.bubblingListners[e][i].callback.apply(this, args);

	                        if (this.bubblingListners[e][i].once) {

	                            todelete.push(i);
	                        };
	                        if (response===false) { return response; }
	                    };
	                };

	                if (todelete.length>0) for (var i in todelete) {
	                    this.bubblingListners[e][todelete[i]] = null;
	                };
	            };

	            // Bubbling itself
	            if (this.$scope.$parent && this.$scope.$parent.$synth) {
	                console.log('bubbling ', e);
	                this.$scope.$parent.$synth.bubbling(e, args);
	            }

	            return response;
	        },
			bind : function(e, callback, once) {
				if (typeof this.eventListners[e] != 'object') this.eventListners[e] = [];
				
				this.eventListners[e].push({
					callback: callback,
					once: once
				});

	            var i = this.eventListners[e].length;

				return this;
			},
	        $bind: function(e, callback, once) {
	            if (typeof this.eventListners[e] != 'object') this.eventListners[e] = [];
	            
	            this.eventListners[e].push({
	                callback: callback,
	                once: once
	            });

	            var i = this.eventListners[e].length;

	            return function() {
	                this.eventListners[e][i] = null;
	            }
	        },
	        unbind: function(e, handler) {
	            if (this.eventListners[e]) {
	                if ("undefined"===typeof handler) delete this.eventListners[e];
	                else
	                    for (var i = 0; i < this.eventListners[e].length; ++i) {
	                        if (this.eventListners[e][i]&&this.eventListners[e][i].callback===handler) this.eventListners[e][i] = null;
	                    }
	            }
	            return this;
	        },
			on: function(e, callback, once) {
				if (typeof this.eventListners[e] != 'object') this.eventListners[e] = [];
				
				this.eventListners[e].push({
					callback: this.$inject(callback),
					once: once||false
				});

				/*
				Call callback if event already fired
				*/
				if ("object"===typeof this.eventTracks[e]) callback.apply(this.eventTracks[e][0], this.eventTracks[e][1]);

				return new eventListner(this, e, this.eventListners[e].length-1);
			},
	        $on: function(e, callback, once) {
	            if (typeof this.eventListners[e] != 'object') this.eventListners[e] = [];
	            
	            

	            /*
	            Call callback if event already fired
	            */
	            if ("object"===typeof this.eventTracks[e]) callback.apply(this.eventTracks[e][0], this.eventTracks[e][1]);
	            
	                this.eventListners[e].push({
	                    callback: this.$inject(callback),
	                    once: once||false
	                });

	                var $handler = new eventListner(this, e, this.eventListners[e].length-1);
	            

	            return function() {
	                $handler.destroy();
	                $handler=null;
	            }
	        },
			once : function(e, callback) {
				this.bind(e, callback, true);
				return this;
			},
			trigger : function() {			
				if (typeof arguments[0] == 'integer') {
					var uin = arguments[0];
					var e = arguments[1];
					var args = (arguments.length>2) ? arguments[2] : [];
				} else {
					var uin = false;
					var e = arguments[0];
					var args = (arguments.length>1) ? arguments[1] : [];
				};
				
				var response = false;

				
				this.eventTracks[e]=[this, args];

				if (typeof this.eventListners[e] == 'object' && this.eventListners[e].length>0) {
					var todelete = [];
	                if (this.eventListners[e]) {
	    				for (var i = 0; i<this.eventListners[e].length; i++) {
	    					if (this.eventListners[e] && this.eventListners[e][i]!==null) {
	    						if (this.eventListners && typeof this.eventListners[e][i].callback === "function") response = this.eventListners[e][i].callback.apply(this, args);
	    						
	    						if (this.eventListners && this.eventListners[e] && this.eventListners[e][i].once) {

	    							todelete.push(i);
	    						};
	                            if ("undefined"===typeof this.eventListners[e]) break;
	    					};
	    				};
	                };
					
					if (todelete.length>0) for (var i in todelete) {
						this.eventListners[e][todelete[i]] = null;
					};
				};
				return response;
			},
			/*
			Очищает от событий
			*/
			clearEventListners: function() {
				this.eventListners = {};
			}
		}

		module.exports = Events;


/***/ },
/* 4 */
/***/ function(module, exports) {

	
		var funcarguments = new RegExp(/[\d\t]*function[ ]?\(([^\)]*)\)/i), 
	    scopesregex = /({[^{}}]*[\n\r]*})/g, 
	    funcarguments = new RegExp(/[\d\t]*function[ ]?\(([^\)]*)\)/i), 
	    getFunctionArguments = function(code) {
	        if (funcarguments.test(code)) {
	            var match = funcarguments.exec(code);
	            return match[1].replace(/[\s\n\r\t]*/g,'').split(',');
	        }
	        return [];
	    };
	    module.exports = function(callback, context) {
	        var prefixedArguments = [], 
	        requiredArguments = getFunctionArguments(callback.toString());

	        for (var i = 0; i < requiredArguments.length; ++i) {
	            if (this instanceof Array) {
	                for (var j = 0; j < this.length; ++j) {
	                    if (this[j].hasOwnProperty(requiredArguments[i]) 
	                        && ("object" === typeof this[j][requiredArguments[i]] || "function" === typeof this[j][requiredArguments[i]])) {
	                        prefixedArguments[i] = this[j][requiredArguments[i]];
	                    }
	                }
	            } else if (this.hasOwnProperty(requiredArguments[i]) && ("object" === typeof this[requiredArguments[i]] || "function" === typeof this[requiredArguments[i]])) {
	                prefixedArguments[i] = this[requiredArguments[i]];
	            }
	        }
	        var injected = function() {

	            return callback.apply(context || this, prefixedArguments.concat(Array.prototype.slice.call(arguments)));
	        };
	        injected.$$injected = true;
	        return injected;
	    };

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = function(txt) {
		return txt.replace(/-([\da-z])/gi, function( all, letter ) {
			return letter.toUpperCase();
		});
	};

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	// onCreatedCallbacks


		var mixin = __webpack_require__(2);
		var Creed = __webpack_require__(7).Creed;
		var smartCallback = __webpack_require__(4);
		var ComponentPreset = __webpack_require__(14);

		var preFactory = function(options) {
			this.name = options.name;
			this.engine = options.engine;
			this.config = {}; // Configuration
			this.presets = {}; // List of user presets
		}
		.inherit(Creed)
		.proto({
			constructor: preFactory,
			// Temp method
			$addConceivedMethod: function(fn, args) {
				this.presets['@'].$conceivedCallers(fn, args);
			},
			created: function(callback) {
				this.presets['@'].$onCreate(callback);
				return this;
			},
			attached: function(callback) {
				this.presets['@'].$onAttach(callback);
				return this;
			},
			detached: function(callback) {
				this.presets['@'].$onDetach(callback);
				return this;
			},
			attributeChanged: function(callback) {
				this.presets['@'].$observeAttrs(callback);
				return this;
			},
			watch: function() {
				this.presets['@'].$watch.apply(this.presets['@'], Array.prototype.slice.apply(arguments));
				return this;
			},
			proto: function(proto) {
				this.presets['@'].$methods(proto);
				return this;
			},
			construct: function(c) {
				this.presets['@'].$cunstruct(callback);
				return this;
			},
			template: function() {
				this.presets['@'].$template.apply(this.presets['@'], Array.prototype.slice.apply(arguments));
				return this;
			},
			config: function(config) {
				this.presets['@'].$config(config);
				return this;
			},
			createPreset: function(name, workshop) {

				this.presets[name] = new ComponentPreset(this, name, workshop);
				return this.presets[name];
			},
			/*
			Execute workshop with prest
			*/
			$usePreset: function(name, workshop, context) {
				if (!(name instanceof Array)) name = [name];
				for (var i = 0;i<name.length;++i) {
					if ("object"!==typeof this.presets[name[i]]) throw 'Undefined preset';
					this.presets[name[i]].$use(workshop, context);
				}
				return this;
			}
		});

		module.exports = preFactory;

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {
	var Promise = __webpack_require__(8).Promise;
	var inject = __webpack_require__(13).inject;

	var Polypromise = function() {

	}

	/*
	Сredible
	*/
	var Creed = function(cb) {

		Object.defineProperty(this, '__credible__', {
			enumerable: false,
			writable: false,
			configurable: false,
			pending: false,
			resolver: false,
			value: {
				state: 0, // Wait for state
				resolveQueue: [], // Queue of then callback functions
				rejectQueue: [], // Queue of catch callback functions
				data: []
			}
		});

		if ("function"===typeof cb) this.$eval(cb);
	};

	Creed.prototype = {
		constructor: Creed,
		/*
		Just eval cb like classic promise resolver
		*/
		$eval: function(cb) {
			var self = this;
			this.__credible__.resolver = cb;
			cb.call(this, function() {
				self.$resolve.apply(self, arguments);
			}, function(result) { self.$reject.apply(self, arguments); });
			return this;
		},
		/*
		Ignore last pending resolver if got new pending
		*/
		$pending: function(cb) {
			this.__credible__.state=0;
			if (this.__credible__.pending) {
				delete this.__credible__.pending;
			}

			var p = new Creed();
			this.__credible__.pending = p;
			var self = this;
			p.then(function(response) {
				if (self.__credible__.pending===p) // Ignore deprecated pendings
				
				self.$resolve(response);
			})
			.catch(function(response) {
				if (self.__credible__.pending===p) // Ignore deprecated pendings
				self.$reject(response);
			});

			p.$eval(cb);
		},
		$resolve: function() {
			//if (this.__credible__.state!==0) throw 'You can not change Creed state twice';
			this.__credible__.state = 1;
			this.__credible__.data = Array.prototype.slice.apply(arguments);
			for (var i =0;i<this.__credible__.resolveQueue.length;++i) {
				this.__credible__.resolveQueue[i][0].apply(this, this.__credible__.data);
				if (!this.__credible__.resolveQueue[i][1]) {
					this.__credible__.resolveQueue.splice(i, 1);i--;
				}
			}
		},
		$reject: function() {
			//if (this.__credible__.state!==0) throw 'You can not change Creed state twice';
			this.__credible__.state = 2;
			this.__credible__.data = Array.prototype.slice.apply(arguments);
			for (var i =0;i<this.__credible__.rejectQueue.length;++i) {
				this.__credible__.rejectQueue[i][0].apply(this, this.__credible__.data);
				if (!this.__credible__.rejectQueue[i][1]) {
					this.__credible__.rejectQueue.splice(i, 1);i--;
				}
			}
		},
		then: function(cb, stayalive) {
			if (this.__credible__.state===0 || stayalive) this.__credible__.resolveQueue.push([cb, !!stayalive]);
			if (this.__credible__.state===1) {

	            cb.apply(this, this.__credible__.data);
	        }
			return this;
		},
		catch: function(cb, stayalive) { 
			if (this.__credible__.state===0 || stayalive) this.__credible__.rejectQueue.push([cb, !!stayalive]);
			if (this.__credible__.state===2) cb.apply(this, this.__credible__.data);
			return this;
		}
	}

	/*
	Promises
	*/
	var Promises = function(spawn) {
		// Inherit Creed
		Creed.apply(this);

		this.$promises = [];
		this.$results = [];
		this.$state = 0;
		this.$completed = 0;
		this.$finished = false;
		var self = this;
		var SubPromise = function(cb) {
			if ("object"===typeof window&&this===window||"object"===typeof global&&this===global) {
				var sp = new SubPromise(cb);
			} else {
				// Inherit Creed
				Creed.call(this, cb);
				self.$promises.push(this);
			}
		};

		SubPromise.prototype = Object.create(Creed.prototype, {
			constructor: {
		        value: SubPromise
		    }
		});

		spawn(SubPromise);

		if (this.$promises.length>0)
		for (var i = 0;i<this.$promises.length;++i) {
			this.$promises[i]
			.then(function(io, val) {
				this.$results[io[0]] = val;
				if (!io[1]) { ++this.$completed; io[1]=true; }
				this.$$test();
			}.bind(this, [i,false]), true)
			.catch(function(io, e) {
				this.$results[io[0]] = e;
				this.$state = 2; // Force reject
				if (!io[1]) { ++this.$completed; io[1]=true; }
				this.$$test();
			}.bind(this, [i,false]), true);
		}
		else {
			this.$state = 1; // Force reject
			this.$$test();
		}
	}

	Promises.prototype = Object.create(Creed.prototype, {
		constructor: {
	        value: Promises
	    },
		$$test: {
	        value: function() {
	            if (this.$completed===this.$promises.length) {
	                this.$state = this.$state!==2 ? 1 : 2;
	                this.$finished = true;
	                this[this.$state===1 ? '$resolve' : '$reject'].apply(this, this.$results);
	            }
	        }
	    }
	});


	/*
	Pending
	*/
	var pendings = {}, 
	Pending = function(callback, args) {
		Creed.apply(this);
		this.$id = null;
		var id = callback.toString()+( "object"===typeof args ? JSON.stringify(args) : (args===undefined ? '' : args.toString()) );
		this.$id = id;
		if (pendings[id]) {
			pendings[id].queue.push(this);
		} else {
			pendings[id] = {
				queue: [],
				result: null,
				done: 0
			};
			pendings[id].queue.push(this);

			if ("function"===typeof callback) {

	            var promising = new Creed(function(resolve, reject) {
	            	var injector = inject(callback, {
		            	resolve: resolve,
		            	reject: reject
		            }, this);
		            injector.apply(this, args);
	            });
	        } else if ("object"===typeof callback) {
	            var promising = callback;
	        } else {
	            throw 'Pending first argument can be function or Promise, but '+typeof callback+' found';
	        }

			promising.then(function(result) {
				var requeue = pendings[id].queue;
				pendings[id].result = result;
				pendings[id].status = 1;

				for (var i = 0; i < requeue.length;++i) {
					requeue[i].$resolve(result);
				}

				// Clear pending queue list after moment
				setTimeout(function() {
					delete pendings[id];
				});
			})
			.catch(function(result) {
				var requeue = pendings[id].queue;
				pendings[id].result = result;
				pendings[id].status = 2;
				for (var i = 0; i < requeue.length;++i) {
					requeue[i].$catch(result);
				}
				// Clear pending queue list after moment
				setTimeout(function() {
					delete pendings[id];
				});
			});
		}
	};

	Pending.prototype = {
		constructor: Pending,
	    $resolve: function() {
	        if (this.__credible__.state!==0) throw 'You can not change Creed state twice';
	        this.__credible__.state = 1;
	        this.__credible__.data = Array.prototype.slice.apply(arguments);
	        for (var i =0;i<this.__credible__.resolveQueue.length;++i) {
	            this.__credible__.resolveQueue[i][0].apply(this, this.__credible__.data);
	            if (!this.__credible__.resolveQueue[i][1]) {
	                this.__credible__.resolveQueue.splice(i, 1);i--;
	            }
	        }
	    },
	    $reject: function() {
	        if (this.__credible__.state!==0) throw 'You can not change Creed state twice';
	        this.__credible__.state = 2;
	        this.__credible__.data = Array.prototype.slice.apply(arguments);
	        for (var i =0;i<this.__credible__.rejectQueue.length;++i) {
	            this.__credible__.rejectQueue[i][0].apply(this, this.__credible__.data);
	            if (!this.__credible__.rejectQueue[i][1]) {
	                this.__credible__.rejectQueue.splice(i, 1);i--;
	            }
	        }
	    },
	    then: function(cb, stayalive) {
	        if (this.__credible__.state===0) this.__credible__.resolveQueue.push([cb, !!stayalive]);
	        else if (this.__credible__.state===1) cb.apply(this, this.__credible__.data);
	        return this;
	    },
	    catch: function(cb, stayalive) {
	        if (this.__credible__.state===0) this.__credible__.rejectQueue.push([cb, !!stayalive]);
	        else if (this.__credible__.state===2) cb.apply(this, this.__credible__.data);
	        return this;
	    }
	};

	Polypromise.Promise = Promise;
	Polypromise.Promises = Promises;
	Polypromise.Pending = Pending;
	Polypromise.Creed = Creed;


	module.exports = Polypromise;

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var require;var __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(process, global, module) {/*!
	 * @overview es6-promise - a tiny implementation of Promises/A+.
	 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
	 * @license   Licensed under MIT license
	 *            See https://raw.githubusercontent.com/jakearchibald/es6-promise/master/LICENSE
	 * @version   3.0.2
	 */

	(function() {
	    "use strict";
	    function lib$es6$promise$utils$$objectOrFunction(x) {
	      return typeof x === 'function' || (typeof x === 'object' && x !== null);
	    }

	    function lib$es6$promise$utils$$isFunction(x) {
	      return typeof x === 'function';
	    }

	    function lib$es6$promise$utils$$isMaybeThenable(x) {
	      return typeof x === 'object' && x !== null;
	    }

	    var lib$es6$promise$utils$$_isArray;
	    if (!Array.isArray) {
	      lib$es6$promise$utils$$_isArray = function (x) {
	        return Object.prototype.toString.call(x) === '[object Array]';
	      };
	    } else {
	      lib$es6$promise$utils$$_isArray = Array.isArray;
	    }

	    var lib$es6$promise$utils$$isArray = lib$es6$promise$utils$$_isArray;
	    var lib$es6$promise$asap$$len = 0;
	    var lib$es6$promise$asap$$toString = {}.toString;
	    var lib$es6$promise$asap$$vertxNext;
	    var lib$es6$promise$asap$$customSchedulerFn;

	    var lib$es6$promise$asap$$asap = function asap(callback, arg) {
	      lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len] = callback;
	      lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len + 1] = arg;
	      lib$es6$promise$asap$$len += 2;
	      if (lib$es6$promise$asap$$len === 2) {
	        // If len is 2, that means that we need to schedule an async flush.
	        // If additional callbacks are queued before the queue is flushed, they
	        // will be processed by this flush that we are scheduling.
	        if (lib$es6$promise$asap$$customSchedulerFn) {
	          lib$es6$promise$asap$$customSchedulerFn(lib$es6$promise$asap$$flush);
	        } else {
	          lib$es6$promise$asap$$scheduleFlush();
	        }
	      }
	    }

	    function lib$es6$promise$asap$$setScheduler(scheduleFn) {
	      lib$es6$promise$asap$$customSchedulerFn = scheduleFn;
	    }

	    function lib$es6$promise$asap$$setAsap(asapFn) {
	      lib$es6$promise$asap$$asap = asapFn;
	    }

	    var lib$es6$promise$asap$$browserWindow = (typeof window !== 'undefined') ? window : undefined;
	    var lib$es6$promise$asap$$browserGlobal = lib$es6$promise$asap$$browserWindow || {};
	    var lib$es6$promise$asap$$BrowserMutationObserver = lib$es6$promise$asap$$browserGlobal.MutationObserver || lib$es6$promise$asap$$browserGlobal.WebKitMutationObserver;
	    var lib$es6$promise$asap$$isNode = typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

	    // test for web worker but not in IE10
	    var lib$es6$promise$asap$$isWorker = typeof Uint8ClampedArray !== 'undefined' &&
	      typeof importScripts !== 'undefined' &&
	      typeof MessageChannel !== 'undefined';

	    // node
	    function lib$es6$promise$asap$$useNextTick() {
	      // node version 0.10.x displays a deprecation warning when nextTick is used recursively
	      // see https://github.com/cujojs/when/issues/410 for details
	      return function() {
	        process.nextTick(lib$es6$promise$asap$$flush);
	      };
	    }

	    // vertx
	    function lib$es6$promise$asap$$useVertxTimer() {
	      return function() {
	        lib$es6$promise$asap$$vertxNext(lib$es6$promise$asap$$flush);
	      };
	    }

	    function lib$es6$promise$asap$$useMutationObserver() {
	      var iterations = 0;
	      var observer = new lib$es6$promise$asap$$BrowserMutationObserver(lib$es6$promise$asap$$flush);
	      var node = document.createTextNode('');
	      observer.observe(node, { characterData: true });

	      return function() {
	        node.data = (iterations = ++iterations % 2);
	      };
	    }

	    // web worker
	    function lib$es6$promise$asap$$useMessageChannel() {
	      var channel = new MessageChannel();
	      channel.port1.onmessage = lib$es6$promise$asap$$flush;
	      return function () {
	        channel.port2.postMessage(0);
	      };
	    }

	    function lib$es6$promise$asap$$useSetTimeout() {
	      return function() {
	        setTimeout(lib$es6$promise$asap$$flush, 1);
	      };
	    }

	    var lib$es6$promise$asap$$queue = new Array(1000);
	    function lib$es6$promise$asap$$flush() {
	      for (var i = 0; i < lib$es6$promise$asap$$len; i+=2) {
	        var callback = lib$es6$promise$asap$$queue[i];
	        var arg = lib$es6$promise$asap$$queue[i+1];

	        callback(arg);

	        lib$es6$promise$asap$$queue[i] = undefined;
	        lib$es6$promise$asap$$queue[i+1] = undefined;
	      }

	      lib$es6$promise$asap$$len = 0;
	    }

	    function lib$es6$promise$asap$$attemptVertx() {
	      try {
	        var r = require;
	        var vertx = __webpack_require__(11);
	        lib$es6$promise$asap$$vertxNext = vertx.runOnLoop || vertx.runOnContext;
	        return lib$es6$promise$asap$$useVertxTimer();
	      } catch(e) {
	        return lib$es6$promise$asap$$useSetTimeout();
	      }
	    }

	    var lib$es6$promise$asap$$scheduleFlush;
	    // Decide what async method to use to triggering processing of queued callbacks:
	    if (lib$es6$promise$asap$$isNode) {
	      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useNextTick();
	    } else if (lib$es6$promise$asap$$BrowserMutationObserver) {
	      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMutationObserver();
	    } else if (lib$es6$promise$asap$$isWorker) {
	      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMessageChannel();
	    } else if (lib$es6$promise$asap$$browserWindow === undefined && "function" === 'function') {
	      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$attemptVertx();
	    } else {
	      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useSetTimeout();
	    }

	    function lib$es6$promise$$internal$$noop() {}

	    var lib$es6$promise$$internal$$PENDING   = void 0;
	    var lib$es6$promise$$internal$$FULFILLED = 1;
	    var lib$es6$promise$$internal$$REJECTED  = 2;

	    var lib$es6$promise$$internal$$GET_THEN_ERROR = new lib$es6$promise$$internal$$ErrorObject();

	    function lib$es6$promise$$internal$$selfFulfillment() {
	      return new TypeError("You cannot resolve a promise with itself");
	    }

	    function lib$es6$promise$$internal$$cannotReturnOwn() {
	      return new TypeError('A promises callback cannot return that same promise.');
	    }

	    function lib$es6$promise$$internal$$getThen(promise) {
	      try {
	        return promise.then;
	      } catch(error) {
	        lib$es6$promise$$internal$$GET_THEN_ERROR.error = error;
	        return lib$es6$promise$$internal$$GET_THEN_ERROR;
	      }
	    }

	    function lib$es6$promise$$internal$$tryThen(then, value, fulfillmentHandler, rejectionHandler) {
	      try {
	        then.call(value, fulfillmentHandler, rejectionHandler);
	      } catch(e) {
	        return e;
	      }
	    }

	    function lib$es6$promise$$internal$$handleForeignThenable(promise, thenable, then) {
	       lib$es6$promise$asap$$asap(function(promise) {
	        var sealed = false;
	        var error = lib$es6$promise$$internal$$tryThen(then, thenable, function(value) {
	          if (sealed) { return; }
	          sealed = true;
	          if (thenable !== value) {
	            lib$es6$promise$$internal$$resolve(promise, value);
	          } else {
	            lib$es6$promise$$internal$$fulfill(promise, value);
	          }
	        }, function(reason) {
	          if (sealed) { return; }
	          sealed = true;

	          lib$es6$promise$$internal$$reject(promise, reason);
	        }, 'Settle: ' + (promise._label || ' unknown promise'));

	        if (!sealed && error) {
	          sealed = true;
	          lib$es6$promise$$internal$$reject(promise, error);
	        }
	      }, promise);
	    }

	    function lib$es6$promise$$internal$$handleOwnThenable(promise, thenable) {
	      if (thenable._state === lib$es6$promise$$internal$$FULFILLED) {
	        lib$es6$promise$$internal$$fulfill(promise, thenable._result);
	      } else if (thenable._state === lib$es6$promise$$internal$$REJECTED) {
	        lib$es6$promise$$internal$$reject(promise, thenable._result);
	      } else {
	        lib$es6$promise$$internal$$subscribe(thenable, undefined, function(value) {
	          lib$es6$promise$$internal$$resolve(promise, value);
	        }, function(reason) {
	          lib$es6$promise$$internal$$reject(promise, reason);
	        });
	      }
	    }

	    function lib$es6$promise$$internal$$handleMaybeThenable(promise, maybeThenable) {
	      if (maybeThenable.constructor === promise.constructor) {
	        lib$es6$promise$$internal$$handleOwnThenable(promise, maybeThenable);
	      } else {
	        var then = lib$es6$promise$$internal$$getThen(maybeThenable);

	        if (then === lib$es6$promise$$internal$$GET_THEN_ERROR) {
	          lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$GET_THEN_ERROR.error);
	        } else if (then === undefined) {
	          lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
	        } else if (lib$es6$promise$utils$$isFunction(then)) {
	          lib$es6$promise$$internal$$handleForeignThenable(promise, maybeThenable, then);
	        } else {
	          lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
	        }
	      }
	    }

	    function lib$es6$promise$$internal$$resolve(promise, value) {
	      if (promise === value) {
	        lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$selfFulfillment());
	      } else if (lib$es6$promise$utils$$objectOrFunction(value)) {
	        lib$es6$promise$$internal$$handleMaybeThenable(promise, value);
	      } else {
	        lib$es6$promise$$internal$$fulfill(promise, value);
	      }
	    }

	    function lib$es6$promise$$internal$$publishRejection(promise) {
	      if (promise._onerror) {
	        promise._onerror(promise._result);
	      }

	      lib$es6$promise$$internal$$publish(promise);
	    }

	    function lib$es6$promise$$internal$$fulfill(promise, value) {
	      if (promise._state !== lib$es6$promise$$internal$$PENDING) { return; }

	      promise._result = value;
	      promise._state = lib$es6$promise$$internal$$FULFILLED;

	      if (promise._subscribers.length !== 0) {
	        lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publish, promise);
	      }
	    }

	    function lib$es6$promise$$internal$$reject(promise, reason) {
	      if (promise._state !== lib$es6$promise$$internal$$PENDING) { return; }
	      promise._state = lib$es6$promise$$internal$$REJECTED;
	      promise._result = reason;

	      lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publishRejection, promise);
	    }

	    function lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection) {
	      var subscribers = parent._subscribers;
	      var length = subscribers.length;

	      parent._onerror = null;

	      subscribers[length] = child;
	      subscribers[length + lib$es6$promise$$internal$$FULFILLED] = onFulfillment;
	      subscribers[length + lib$es6$promise$$internal$$REJECTED]  = onRejection;

	      if (length === 0 && parent._state) {
	        lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publish, parent);
	      }
	    }

	    function lib$es6$promise$$internal$$publish(promise) {
	      var subscribers = promise._subscribers;
	      var settled = promise._state;

	      if (subscribers.length === 0) { return; }

	      var child, callback, detail = promise._result;

	      for (var i = 0; i < subscribers.length; i += 3) {
	        child = subscribers[i];
	        callback = subscribers[i + settled];

	        if (child) {
	          lib$es6$promise$$internal$$invokeCallback(settled, child, callback, detail);
	        } else {
	          callback(detail);
	        }
	      }

	      promise._subscribers.length = 0;
	    }

	    function lib$es6$promise$$internal$$ErrorObject() {
	      this.error = null;
	    }

	    var lib$es6$promise$$internal$$TRY_CATCH_ERROR = new lib$es6$promise$$internal$$ErrorObject();

	    function lib$es6$promise$$internal$$tryCatch(callback, detail) {
	      try {
	        return callback(detail);
	      } catch(e) {
	        lib$es6$promise$$internal$$TRY_CATCH_ERROR.error = e;
	        return lib$es6$promise$$internal$$TRY_CATCH_ERROR;
	      }
	    }

	    function lib$es6$promise$$internal$$invokeCallback(settled, promise, callback, detail) {
	      var hasCallback = lib$es6$promise$utils$$isFunction(callback),
	          value, error, succeeded, failed;

	      if (hasCallback) {
	        value = lib$es6$promise$$internal$$tryCatch(callback, detail);

	        if (value === lib$es6$promise$$internal$$TRY_CATCH_ERROR) {
	          failed = true;
	          error = value.error;
	          value = null;
	        } else {
	          succeeded = true;
	        }

	        if (promise === value) {
	          lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$cannotReturnOwn());
	          return;
	        }

	      } else {
	        value = detail;
	        succeeded = true;
	      }

	      if (promise._state !== lib$es6$promise$$internal$$PENDING) {
	        // noop
	      } else if (hasCallback && succeeded) {
	        lib$es6$promise$$internal$$resolve(promise, value);
	      } else if (failed) {
	        lib$es6$promise$$internal$$reject(promise, error);
	      } else if (settled === lib$es6$promise$$internal$$FULFILLED) {
	        lib$es6$promise$$internal$$fulfill(promise, value);
	      } else if (settled === lib$es6$promise$$internal$$REJECTED) {
	        lib$es6$promise$$internal$$reject(promise, value);
	      }
	    }

	    function lib$es6$promise$$internal$$initializePromise(promise, resolver) {
	      try {
	        resolver(function resolvePromise(value){
	          lib$es6$promise$$internal$$resolve(promise, value);
	        }, function rejectPromise(reason) {
	          lib$es6$promise$$internal$$reject(promise, reason);
	        });
	      } catch(e) {
	        lib$es6$promise$$internal$$reject(promise, e);
	      }
	    }

	    function lib$es6$promise$enumerator$$Enumerator(Constructor, input) {
	      var enumerator = this;

	      enumerator._instanceConstructor = Constructor;
	      enumerator.promise = new Constructor(lib$es6$promise$$internal$$noop);

	      if (enumerator._validateInput(input)) {
	        enumerator._input     = input;
	        enumerator.length     = input.length;
	        enumerator._remaining = input.length;

	        enumerator._init();

	        if (enumerator.length === 0) {
	          lib$es6$promise$$internal$$fulfill(enumerator.promise, enumerator._result);
	        } else {
	          enumerator.length = enumerator.length || 0;
	          enumerator._enumerate();
	          if (enumerator._remaining === 0) {
	            lib$es6$promise$$internal$$fulfill(enumerator.promise, enumerator._result);
	          }
	        }
	      } else {
	        lib$es6$promise$$internal$$reject(enumerator.promise, enumerator._validationError());
	      }
	    }

	    lib$es6$promise$enumerator$$Enumerator.prototype._validateInput = function(input) {
	      return lib$es6$promise$utils$$isArray(input);
	    };

	    lib$es6$promise$enumerator$$Enumerator.prototype._validationError = function() {
	      return new Error('Array Methods must be provided an Array');
	    };

	    lib$es6$promise$enumerator$$Enumerator.prototype._init = function() {
	      this._result = new Array(this.length);
	    };

	    var lib$es6$promise$enumerator$$default = lib$es6$promise$enumerator$$Enumerator;

	    lib$es6$promise$enumerator$$Enumerator.prototype._enumerate = function() {
	      var enumerator = this;

	      var length  = enumerator.length;
	      var promise = enumerator.promise;
	      var input   = enumerator._input;

	      for (var i = 0; promise._state === lib$es6$promise$$internal$$PENDING && i < length; i++) {
	        enumerator._eachEntry(input[i], i);
	      }
	    };

	    lib$es6$promise$enumerator$$Enumerator.prototype._eachEntry = function(entry, i) {
	      var enumerator = this;
	      var c = enumerator._instanceConstructor;

	      if (lib$es6$promise$utils$$isMaybeThenable(entry)) {
	        if (entry.constructor === c && entry._state !== lib$es6$promise$$internal$$PENDING) {
	          entry._onerror = null;
	          enumerator._settledAt(entry._state, i, entry._result);
	        } else {
	          enumerator._willSettleAt(c.resolve(entry), i);
	        }
	      } else {
	        enumerator._remaining--;
	        enumerator._result[i] = entry;
	      }
	    };

	    lib$es6$promise$enumerator$$Enumerator.prototype._settledAt = function(state, i, value) {
	      var enumerator = this;
	      var promise = enumerator.promise;

	      if (promise._state === lib$es6$promise$$internal$$PENDING) {
	        enumerator._remaining--;

	        if (state === lib$es6$promise$$internal$$REJECTED) {
	          lib$es6$promise$$internal$$reject(promise, value);
	        } else {
	          enumerator._result[i] = value;
	        }
	      }

	      if (enumerator._remaining === 0) {
	        lib$es6$promise$$internal$$fulfill(promise, enumerator._result);
	      }
	    };

	    lib$es6$promise$enumerator$$Enumerator.prototype._willSettleAt = function(promise, i) {
	      var enumerator = this;

	      lib$es6$promise$$internal$$subscribe(promise, undefined, function(value) {
	        enumerator._settledAt(lib$es6$promise$$internal$$FULFILLED, i, value);
	      }, function(reason) {
	        enumerator._settledAt(lib$es6$promise$$internal$$REJECTED, i, reason);
	      });
	    };
	    function lib$es6$promise$promise$all$$all(entries) {
	      return new lib$es6$promise$enumerator$$default(this, entries).promise;
	    }
	    var lib$es6$promise$promise$all$$default = lib$es6$promise$promise$all$$all;
	    function lib$es6$promise$promise$race$$race(entries) {
	      /*jshint validthis:true */
	      var Constructor = this;

	      var promise = new Constructor(lib$es6$promise$$internal$$noop);

	      if (!lib$es6$promise$utils$$isArray(entries)) {
	        lib$es6$promise$$internal$$reject(promise, new TypeError('You must pass an array to race.'));
	        return promise;
	      }

	      var length = entries.length;

	      function onFulfillment(value) {
	        lib$es6$promise$$internal$$resolve(promise, value);
	      }

	      function onRejection(reason) {
	        lib$es6$promise$$internal$$reject(promise, reason);
	      }

	      for (var i = 0; promise._state === lib$es6$promise$$internal$$PENDING && i < length; i++) {
	        lib$es6$promise$$internal$$subscribe(Constructor.resolve(entries[i]), undefined, onFulfillment, onRejection);
	      }

	      return promise;
	    }
	    var lib$es6$promise$promise$race$$default = lib$es6$promise$promise$race$$race;
	    function lib$es6$promise$promise$resolve$$resolve(object) {
	      /*jshint validthis:true */
	      var Constructor = this;

	      if (object && typeof object === 'object' && object.constructor === Constructor) {
	        return object;
	      }

	      var promise = new Constructor(lib$es6$promise$$internal$$noop);
	      lib$es6$promise$$internal$$resolve(promise, object);
	      return promise;
	    }
	    var lib$es6$promise$promise$resolve$$default = lib$es6$promise$promise$resolve$$resolve;
	    function lib$es6$promise$promise$reject$$reject(reason) {
	      /*jshint validthis:true */
	      var Constructor = this;
	      var promise = new Constructor(lib$es6$promise$$internal$$noop);
	      lib$es6$promise$$internal$$reject(promise, reason);
	      return promise;
	    }
	    var lib$es6$promise$promise$reject$$default = lib$es6$promise$promise$reject$$reject;

	    var lib$es6$promise$promise$$counter = 0;

	    function lib$es6$promise$promise$$needsResolver() {
	      throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
	    }

	    function lib$es6$promise$promise$$needsNew() {
	      throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
	    }

	    var lib$es6$promise$promise$$default = lib$es6$promise$promise$$Promise;
	    /**
	      Promise objects represent the eventual result of an asynchronous operation. The
	      primary way of interacting with a promise is through its `then` method, which
	      registers callbacks to receive either a promise's eventual value or the reason
	      why the promise cannot be fulfilled.

	      Terminology
	      -----------

	      - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
	      - `thenable` is an object or function that defines a `then` method.
	      - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
	      - `exception` is a value that is thrown using the throw statement.
	      - `reason` is a value that indicates why a promise was rejected.
	      - `settled` the final resting state of a promise, fulfilled or rejected.

	      A promise can be in one of three states: pending, fulfilled, or rejected.

	      Promises that are fulfilled have a fulfillment value and are in the fulfilled
	      state.  Promises that are rejected have a rejection reason and are in the
	      rejected state.  A fulfillment value is never a thenable.

	      Promises can also be said to *resolve* a value.  If this value is also a
	      promise, then the original promise's settled state will match the value's
	      settled state.  So a promise that *resolves* a promise that rejects will
	      itself reject, and a promise that *resolves* a promise that fulfills will
	      itself fulfill.


	      Basic Usage:
	      ------------

	      ```js
	      var promise = new Promise(function(resolve, reject) {
	        // on success
	        resolve(value);

	        // on failure
	        reject(reason);
	      });

	      promise.then(function(value) {
	        // on fulfillment
	      }, function(reason) {
	        // on rejection
	      });
	      ```

	      Advanced Usage:
	      ---------------

	      Promises shine when abstracting away asynchronous interactions such as
	      `XMLHttpRequest`s.

	      ```js
	      function getJSON(url) {
	        return new Promise(function(resolve, reject){
	          var xhr = new XMLHttpRequest();

	          xhr.open('GET', url);
	          xhr.onreadystatechange = handler;
	          xhr.responseType = 'json';
	          xhr.setRequestHeader('Accept', 'application/json');
	          xhr.send();

	          function handler() {
	            if (this.readyState === this.DONE) {
	              if (this.status === 200) {
	                resolve(this.response);
	              } else {
	                reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
	              }
	            }
	          };
	        });
	      }

	      getJSON('/posts.json').then(function(json) {
	        // on fulfillment
	      }, function(reason) {
	        // on rejection
	      });
	      ```

	      Unlike callbacks, promises are great composable primitives.

	      ```js
	      Promise.all([
	        getJSON('/posts'),
	        getJSON('/comments')
	      ]).then(function(values){
	        values[0] // => postsJSON
	        values[1] // => commentsJSON

	        return values;
	      });
	      ```

	      @class Promise
	      @param {function} resolver
	      Useful for tooling.
	      @constructor
	    */
	    function lib$es6$promise$promise$$Promise(resolver) {
	      this._id = lib$es6$promise$promise$$counter++;
	      this._state = undefined;
	      this._result = undefined;
	      this._subscribers = [];

	      if (lib$es6$promise$$internal$$noop !== resolver) {
	        if (!lib$es6$promise$utils$$isFunction(resolver)) {
	          lib$es6$promise$promise$$needsResolver();
	        }

	        if (!(this instanceof lib$es6$promise$promise$$Promise)) {
	          lib$es6$promise$promise$$needsNew();
	        }

	        lib$es6$promise$$internal$$initializePromise(this, resolver);
	      }
	    }

	    lib$es6$promise$promise$$Promise.all = lib$es6$promise$promise$all$$default;
	    lib$es6$promise$promise$$Promise.race = lib$es6$promise$promise$race$$default;
	    lib$es6$promise$promise$$Promise.resolve = lib$es6$promise$promise$resolve$$default;
	    lib$es6$promise$promise$$Promise.reject = lib$es6$promise$promise$reject$$default;
	    lib$es6$promise$promise$$Promise._setScheduler = lib$es6$promise$asap$$setScheduler;
	    lib$es6$promise$promise$$Promise._setAsap = lib$es6$promise$asap$$setAsap;
	    lib$es6$promise$promise$$Promise._asap = lib$es6$promise$asap$$asap;

	    lib$es6$promise$promise$$Promise.prototype = {
	      constructor: lib$es6$promise$promise$$Promise,

	    /**
	      The primary way of interacting with a promise is through its `then` method,
	      which registers callbacks to receive either a promise's eventual value or the
	      reason why the promise cannot be fulfilled.

	      ```js
	      findUser().then(function(user){
	        // user is available
	      }, function(reason){
	        // user is unavailable, and you are given the reason why
	      });
	      ```

	      Chaining
	      --------

	      The return value of `then` is itself a promise.  This second, 'downstream'
	      promise is resolved with the return value of the first promise's fulfillment
	      or rejection handler, or rejected if the handler throws an exception.

	      ```js
	      findUser().then(function (user) {
	        return user.name;
	      }, function (reason) {
	        return 'default name';
	      }).then(function (userName) {
	        // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
	        // will be `'default name'`
	      });

	      findUser().then(function (user) {
	        throw new Error('Found user, but still unhappy');
	      }, function (reason) {
	        throw new Error('`findUser` rejected and we're unhappy');
	      }).then(function (value) {
	        // never reached
	      }, function (reason) {
	        // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
	        // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
	      });
	      ```
	      If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.

	      ```js
	      findUser().then(function (user) {
	        throw new PedagogicalException('Upstream error');
	      }).then(function (value) {
	        // never reached
	      }).then(function (value) {
	        // never reached
	      }, function (reason) {
	        // The `PedgagocialException` is propagated all the way down to here
	      });
	      ```

	      Assimilation
	      ------------

	      Sometimes the value you want to propagate to a downstream promise can only be
	      retrieved asynchronously. This can be achieved by returning a promise in the
	      fulfillment or rejection handler. The downstream promise will then be pending
	      until the returned promise is settled. This is called *assimilation*.

	      ```js
	      findUser().then(function (user) {
	        return findCommentsByAuthor(user);
	      }).then(function (comments) {
	        // The user's comments are now available
	      });
	      ```

	      If the assimliated promise rejects, then the downstream promise will also reject.

	      ```js
	      findUser().then(function (user) {
	        return findCommentsByAuthor(user);
	      }).then(function (comments) {
	        // If `findCommentsByAuthor` fulfills, we'll have the value here
	      }, function (reason) {
	        // If `findCommentsByAuthor` rejects, we'll have the reason here
	      });
	      ```

	      Simple Example
	      --------------

	      Synchronous Example

	      ```javascript
	      var result;

	      try {
	        result = findResult();
	        // success
	      } catch(reason) {
	        // failure
	      }
	      ```

	      Errback Example

	      ```js
	      findResult(function(result, err){
	        if (err) {
	          // failure
	        } else {
	          // success
	        }
	      });
	      ```

	      Promise Example;

	      ```javascript
	      findResult().then(function(result){
	        // success
	      }, function(reason){
	        // failure
	      });
	      ```

	      Advanced Example
	      --------------

	      Synchronous Example

	      ```javascript
	      var author, books;

	      try {
	        author = findAuthor();
	        books  = findBooksByAuthor(author);
	        // success
	      } catch(reason) {
	        // failure
	      }
	      ```

	      Errback Example

	      ```js

	      function foundBooks(books) {

	      }

	      function failure(reason) {

	      }

	      findAuthor(function(author, err){
	        if (err) {
	          failure(err);
	          // failure
	        } else {
	          try {
	            findBoooksByAuthor(author, function(books, err) {
	              if (err) {
	                failure(err);
	              } else {
	                try {
	                  foundBooks(books);
	                } catch(reason) {
	                  failure(reason);
	                }
	              }
	            });
	          } catch(error) {
	            failure(err);
	          }
	          // success
	        }
	      });
	      ```

	      Promise Example;

	      ```javascript
	      findAuthor().
	        then(findBooksByAuthor).
	        then(function(books){
	          // found books
	      }).catch(function(reason){
	        // something went wrong
	      });
	      ```

	      @method then
	      @param {Function} onFulfilled
	      @param {Function} onRejected
	      Useful for tooling.
	      @return {Promise}
	    */
	      then: function(onFulfillment, onRejection) {
	        var parent = this;
	        var state = parent._state;

	        if (state === lib$es6$promise$$internal$$FULFILLED && !onFulfillment || state === lib$es6$promise$$internal$$REJECTED && !onRejection) {
	          return this;
	        }

	        var child = new this.constructor(lib$es6$promise$$internal$$noop);
	        var result = parent._result;

	        if (state) {
	          var callback = arguments[state - 1];
	          lib$es6$promise$asap$$asap(function(){
	            lib$es6$promise$$internal$$invokeCallback(state, child, callback, result);
	          });
	        } else {
	          lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection);
	        }

	        return child;
	      },

	    /**
	      `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
	      as the catch block of a try/catch statement.

	      ```js
	      function findAuthor(){
	        throw new Error('couldn't find that author');
	      }

	      // synchronous
	      try {
	        findAuthor();
	      } catch(reason) {
	        // something went wrong
	      }

	      // async with promises
	      findAuthor().catch(function(reason){
	        // something went wrong
	      });
	      ```

	      @method catch
	      @param {Function} onRejection
	      Useful for tooling.
	      @return {Promise}
	    */
	      'catch': function(onRejection) {
	        return this.then(null, onRejection);
	      }
	    };
	    function lib$es6$promise$polyfill$$polyfill() {
	      var local;

	      if (typeof global !== 'undefined') {
	          local = global;
	      } else if (typeof self !== 'undefined') {
	          local = self;
	      } else {
	          try {
	              local = Function('return this')();
	          } catch (e) {
	              throw new Error('polyfill failed because global object is unavailable in this environment');
	          }
	      }

	      var P = local.Promise;

	      if (P && Object.prototype.toString.call(P.resolve()) === '[object Promise]' && !P.cast) {
	        return;
	      }

	      local.Promise = lib$es6$promise$promise$$default;
	    }
	    var lib$es6$promise$polyfill$$default = lib$es6$promise$polyfill$$polyfill;

	    var lib$es6$promise$umd$$ES6Promise = {
	      'Promise': lib$es6$promise$promise$$default,
	      'polyfill': lib$es6$promise$polyfill$$default
	    };

	    /* global define:true module:true window: true */
	    if ("function" === 'function' && __webpack_require__(12)['amd']) {
	      !(__WEBPACK_AMD_DEFINE_RESULT__ = function() { return lib$es6$promise$umd$$ES6Promise; }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    } else if (typeof module !== 'undefined' && module['exports']) {
	      module['exports'] = lib$es6$promise$umd$$ES6Promise;
	    } else if (typeof this !== 'undefined') {
	      this['ES6Promise'] = lib$es6$promise$umd$$ES6Promise;
	    }

	    lib$es6$promise$polyfill$$default();
	}).call(this);


	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(9), (function() { return this; }()), __webpack_require__(10)(module)))

/***/ },
/* 9 */
/***/ function(module, exports) {

	// shim for using process in browser

	var process = module.exports = {};
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = setTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    clearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        setTimeout(drainQueue, 0);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 10 */
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 11 */
/***/ function(module, exports) {

	/* (ignored) */

/***/ },
/* 12 */
/***/ function(module, exports) {

	module.exports = function() { throw new Error("define cannot be used indirect"); };


/***/ },
/* 13 */
/***/ function(module, exports) {

	var scopesregex = /({[^{}}]*[\n\r]*})/g,
	funcarguments = new RegExp(/[\d\t]*function[ ]?\(([^\)]*)\)/i),
	getFunctionArguments = function(code) {
		if (funcarguments.test(code)) {
			var match = funcarguments.exec(code);
			return match[1].replace(/[\s\n\r\t]*/g,'').split(',');
		}
		return [];
	};

	var inject = function(callback, args, context) {
		var locals = [],
		requiredArguments = getFunctionArguments(callback.toString());
		

		for (var i = 0;i<requiredArguments.length;++i) {
			if (args instanceof Array) {
				for (var j = 0;j<args.length;++j) {
					var inspect = ("function"===typeof args[j]) ? args[j].apply(context||this) : args[j];
					if (inspect.hasOwnProperty(requiredArguments[i])) {
						locals[i] = inspect[requiredArguments[i]];
					}
				}
			}
			else if (args.hasOwnProperty(requiredArguments[i])) {
				locals[i] = args[requiredArguments[i]];
			}
		}
		
		var injected;
		injected = function() {
			return callback.apply(context||this, locals.concat(Array.prototype.slice.call(arguments)));
		}
		injected.$$injected = true;
		return injected;
	};

	module.exports = {
		inject: inject
	};

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var Creed = __webpack_require__(7).Creed;
	var smartCallback = __webpack_require__(4);
	var extend = __webpack_require__(15);
	__webpack_require__(16);

	module.exports = function(component, name, workshop) {
		this.component = component;
		this.name = name;
		this.performed = false;
		this.$import = {
			config: {},
			prototype: {},
			scope: {}, // Default scope
			onConstruct: [], // Functions on construct
			onCreate: [], // Functions on created
			onAttach: [], // Functions on attached
			onDetach: [], // Functions on detached
			onDestroy: [], // Functions on destroyed
			conceivedCallers: [], // After create static functions
			watchers: [], // Default watchers
			template: false, // Default template (can be an array 1 => String, 2 => Class)
			observeAttrs: [] // Change attrs callbacks
		};

		if (workshop) this.$run(workshop);

		
	}.inherit(Creed)
	.proto({
		$conceivedCallers: function(fn, args) {
			this.$import.conceivedCallers.push([fn, args]);
		},
		$onCreate: function(callback) {
			this.$import.onCreate.push(callback);
		},
		// Construct (onCreated callback)
		$construct: function(callback) {
			this.$import.onConstruct.push(callback);
		},
		// Attach callback
		$onAttach: function(callback) {
			this.$import.onAttach.push(callback);
		},
		// Detach callback
		$onDetach: function(callback) {
			this.$import.onDetach.push(callback);
		},
		// Destroy callback
		$onDestroy: function(callback) {
			this.$import.onDestroy.push(callback);
		},
		// Extend scope
		$scope: function(data) {
			extend(this.$import.scope, data);
		},
		// Watchers
		$watch: function() {
			this.$import.watchers.push(Array.prototype.slice.apply(arguments));
		},
		// Prototype
		$methods: function(prototype) {
			extend(this.$import.prototype, prototype);
		},
		// Default config
		$setup: function(config) {
			if ("object"!==typeof config) throw 'Configuration must be an object';
			extend(this.$import.config, config);
		},
		// Template
		$template: function() {
			this.$import.template = Array.prototype.slice.apply(arguments);
		},
		// Attrs change callbacks
		$observeAttrs: function(callback) {
			this.$import.observeAttrs.push(callback);
		},
		// run preset creator workshop
		$run: function(workshop) {
			var self = this, prototype = smartCallback.call({
				// It self
				$component: this.component,
				$conceivedCallers: function() { self.$conceivedCallers.apply(self, arguments); },
				$onCreate: function() { self.$onCreate.apply(self, arguments); },
				$init: function() { self.$onCreate.apply(self, arguments); },
				$construct: function() { self.$construct.apply(self, arguments); },
				$onAttach: function() { self.$onAttach.apply(self, arguments); },
				$onDetach: function() { self.$onDetach.apply(self, arguments); },
				$onDestroy: function() { self.$onDestroy.apply(self, arguments); },
				$scope: function() { self.$scope.apply(self, arguments); },
				$watch: function() { self.$watch.apply(self, arguments); },
				$proto: function() { self.$methods.apply(self, arguments); },
				$methods: function() { self.$methods.apply(self, arguments); },
				$setup: function() { self.$setup.apply(self, arguments); },
				$template: function() { self.$template.apply(self, arguments); },
				$observeAttrs: function() { self.$observeAttrs.apply(self, arguments); }
			}, workshop, this)();

			if ("object"===typeof prototype) {
		        extend(this.$import.prototype, prototype);
		    }

		    return this;
		},
		// use preset reader workshop
		$use: function(workshop, context, getinjector) {
			var injector = smartCallback.call(this.$import, workshop, context||this);
			if (getinjector) return injector;
			injector();
			return this;
		}
	});

/***/ },
/* 15 */
/***/ function(module, exports) {

	/* Протестировано */

		/* Extend function (modified with pseudo Reference) */
		var hasOwn = Object.prototype.hasOwnProperty;
		var toStr = Object.prototype.toString;

		var isArray = function isArray(arr) {
			if (typeof Array.isArray === 'function') {
				return Array.isArray(arr);
			}

			return toStr.call(arr) === '[object Array]';
		};

		var isPlainObject = function isPlainObject(obj) {
			'use strict';

			if (!obj || toStr.call(obj) !== '[object Object]') {
				return false;
			}

			var has_own_constructor = hasOwn.call(obj, 'constructor');
			var has_is_property_of_method = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
			// Not own constructor property must be Object
			if (obj.constructor && !has_own_constructor && !has_is_property_of_method) {
				return false;
			}

			// Own properties are enumerated firstly, so to speed up,
			// if last one is own, then all properties are own.
			var key;
			for (key in obj) {/**/}

			return typeof key === 'undefined' || hasOwn.call(obj, key);
		};

		var extend = function() {
			'use strict';

			var options, name, src, copy, copyIsArray, clone,
				target = arguments[0],
				i = 1,
				length = arguments.length,
				deep = false;

			// Handle a deep copy situation
			if (typeof target === 'boolean') {
				deep = target;
				target = arguments[1] || {};
				// skip the boolean and the target
				i = 2;
			} else if ((typeof target !== 'object' && typeof target !== 'function') || target == null) {
				target = {};
			}

			for (; i < length; ++i) {
				options = arguments[i];
				// Only deal with non-null/undefined values
				if (options != null) {
					// Extend the base object
					for (name in options) {
						src = target[name];
						copy = options[name];



						// Prevent never-ending loop
						if (target !== copy) {
							// Recurse if we're merging plain objects or arrays
							if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
								if (copyIsArray) {
									copyIsArray = false;
									clone = src && isArray(src) ? src : [];
								} else {
									clone = src && isPlainObject(src) ? src : {};
								}

								if (copy.constructor.name!=='Ref')
								// Never move original objects, clone them
								target[name] = extend(deep, clone, copy);

							// Don't bring in undefined values
							} else if (typeof copy !== 'undefined') {
								target[name] = copy;
							}
						}
					}
				}
			}

			// Return the modified object
			return target;
		};

		module.exports = extend;


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var mixin = __webpack_require__(2);
	var inherit = __webpack_require__(1);

	module.exports = (function() {
		Function.prototype.inherit = function() {
		    var classes = Array.prototype.slice.apply(arguments);
		    return inherit(this, classes);
		}

		Function.prototype.proto = function(proto) {
			if ("object"!==typeof this.prototype) this.prototype = {
				constructor: this
			};
			mixin(this.prototype, proto);
			return this;
		}

		Function.prototype.construct = function() {
			
			this.__disableContructor__ = true;
			
			var module = new this();
			var args = arguments[0] instanceof Array ? arguments[0] : [];
			
			this.apply(module, args);
			return module;
		}

		return inherit;

	})();


/***/ },
/* 17 */
/***/ function(module, exports) {

	module.exports = function() {
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
	};

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	
	    var mixin = __webpack_require__(2);
	    var camelize = __webpack_require__(5);
	    var scopeUtilits = __webpack_require__(19);

	    module.exports = function($self, $$scope, $attrs) {
	        /*
	         Предотвращаем генерацию контроллера, если элемент уже был удален
	         */
	        if ($self.$destroyed) return false;

	        angular.extend($$scope, $self.$$scope);

	        /*
	         Добавляем общие утиилиты
	         */
	        $$scope._ = new scopeUtilits($self);

	        /*
	        Добавляем ссылку на специальный объект module
	        */
	        Object.defineProperty($$scope, '$module', {
	            enumerable: false,
	            cofigurable: false,
	            editable: false,
	            get: function() {
	                return (!$self.module) ? $self.$scope.$parent.$module : $self.module;
	            },
	            set: function(){
	                return false;
	            }
	        });

	        Object.defineProperty($$scope, '$synth', {
	            enumerable: false,
	            cofigurable: false,
	            editable: false,
	            get: function() {
	                return $self;
	            },
	            set: function(){
	                return false;
	            }
	        });

	        /*
	        Назначаем scope уникальный идентификатор, равный уникальному узначению компонента
	        */
	        $$scope.$sid = $self.$sid;

	        $self.$injectors[0].$scope = $$scope;

	        /*
	        Register angular scope as child scope of component
	        */
	        $self.$appendScope($$scope);

	        $self.__config__.allWaitingForResolve = false;

	        $self.__config__.$$angularElement = angular.element($self.$element);

	        $self.__config__.$$angularScope = $$scope;


	        ///////////////   

	        /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	        
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

	        $self.__config__.$$angularInitialedStage = 2;
	        $self.trigger('angularResolved');


	        /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

	        Object.defineProperty($self, '$$angular', {
	            enumerable: false,
	            writable: false,
	            configurable: false,
	            value: Synthetic.$$angularApp
	        });
	    };

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(16);
	module.exports = function($) {
		this.$ = $; // Link to synthetic controller
	}.proto({
		/* Функуция добавляет или удаляет элемент из массива */
		toggleAppend: function(collection, value, force) {
			
			this.$.$apply(function() {
				if ("boolean"!==typeof force) force = !~collection.indexOf(value);
				if (force) {
					collection.push(value);
				} else {
					collection.splice(collection.indexOf(value), 1);
				}
			});
		},
		toggle: function($value) {
	        if ("object" == typeof $value && arguments.length > 1) {
	            this.toggleAppend.apply(this, arguments);
	        } else {

	            return !$value;
	        }
	    }
	});

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	
	    var WebElementPrototype = __webpack_require__(21);
	    var mixin = __webpack_require__(2);
	    var extend = __webpack_require__(15);
	    var Generator = __webpack_require__(28);
	    var camelize = __webpack_require__(5);
	    var getNonScopeValue = __webpack_require__(23);
	    __webpack_require__(16);

	    var presetImport = {};

	    var regScriptContent = /<script[^>]*>([.\w\d\r\t\n\.\s;'"{}\(\)]*)<\/script>/i,
	    regSyntheticScript = /^[\t\r\s]*Synthetic\(/i;
	    
	    /*
	    Процедура импорта методов прототипа
	    */
	    presetImport['presetImportPrototype'] = function(prototype) {
	        for (var p in prototype) {
	            if (prototype.hasOwnProperty(p)) {
	                this[p] = this.$inject(prototype[p]);
	            }
	        }
	    };

	    /*
	    Процедура импорта опции сохранения родного innerHtml
	    */
	    presetImport['presetImportDefaults'] = function(defaultHtml, config) {
	        var self = this;
	        switch (defaultHtml) {
	            case "preserve": // Сохранить в documentFragment
	                self.$injectors[0].$defaultHtml = document.createDocumentFragment();

	                for (var i = 0; i < self.element.childNodes.length; ++i) {
	                    /*
	                    При клонировании элемента обязательно нужно указывать параметр deep (протестировано на sag)
	                    */
	                    if (self.element.childNodes[i].nodeType === 1 || self.element.childNodes[i].nodeType === 3) {
	                        self.$injectors[0].$defaultHtml.appendChild(self.element.childNodes[i].cloneNode(true));
	                    }
	                }

	            break;
	            case "clear": // Очистить и забыть
	                self.element.innerHTML = "";
	            break;
	        }

	        mixin(self.$$scope.$config, config);
	    }

	    /*
	    Коллекция метода импорта значений из preset
	    */
	    presetImport['presetImportWatchers'] = function(watchers) {
	        /*
	        Переносим наблюдение за scope
	        */
	        for (var i = 0;i<watchers.length;++i) {
	            this.$watch.apply(this, watchers[i]);
	        }
	    };

	    /*
	    Процедура импорта callback-функций из presets
	    */
	    presetImport['presetImportCallbacksAction'] = function(conceivedCallers, template, onCreate, onAttach, onDetach, observeAttrs) {
	        var self = this;
	        /*
	        Component conceived methods
	        */
	        for (var i = 0;i<conceivedCallers.length;++i) {
	            self[conceivedCallers[i][0]].apply(self, conceivedCallers[i][1]);
	        }

	        /*
	        Устанавливаем шаблон по умолчанию, если он указан
	        */
	        if (template) {
	            self.$template.apply(self, template);
	        }

	        /*
	        Поочередно вызываем функции для события created (если created уже был)
	        */
	        if (self.__config__.createdEventFires) {
	            for (var i = 0;i<onCreate.length;++i) {
	                self.$inject(onCreate[i])();
	            }
	        } else {
	            for (var i = 0;i<onCreate.length;++i) {
	                self.on("created", onCreate[i]);
	            }
	        }

	        /*
	        Поочередно вызываем функции для события attached (если attached уже был)
	        */
	        if (self.__config__.attachedEventFires) {
	            for (var i = 0;i<onAttach.length;++i) {
	                self.$inject(onAttach[i])();
	            }
	        } else {
	            for (var i = 0;i<onAttach.length;++i) {
	                self.on("attached", onAttach[i]);
	            }
	        }

	        /*
	        Переносим callback для detached
	        */
	        for (var i = 0;i<onDetach.length;++i) {
	            self.on("detached", onDetach[i]);
	        }

	        /*
	        Переносим callback для attributeChanged
	        */
	        for (var i = 0;i<observeAttrs.length;++i) {
	            self.on("attributeChanged", observeAttrs[i]);
	        }
	    };

	    /*
	     Как только элемент попадает в DOM он проходит данную инициализацию.
	     Если работа ведется с angular то этот код должен быть выполнен до
	     того как angular применит compile для этой директивы.

	     Когда angular начнет выполнение compile мы должны быть готовы
	     предоставить ей всю необходимую информацию, желательно template и
	     модуль.
	     */
	    module.exports = function(element, component) {
	        var self = this;
	        /*
	        Указываем последнюю factory для элемента. Она используется при внедлении скрипта через тэг <script>
	        внутри компонента
	        */
	        Synthetic.$$lastElementFactory = this;

	        /*
	        Set element synthetic identifier named as $sid.
	        $sid is a unique name of syntehtic element.
	        */
	        this.$sid = 'sid'+(new Date()).getTime()+Math.round(Math.random()*10000000);

	        /*
	        Add sid to element attributes
	        */
	        element.setAttribute("sid", this.$sid);

	        /*
	        Capture cross event `destroy` of parent element and destroy this element 
	        */
	        this.capture('destroy', function() {
	            this.$destroy();
	        });

	        /*
	        Дополнительный ресурс для watchers, ускоряющий работу за отслеживанием аттрибутов
	        */
	        this.$$attrsWatchers = {};

	        /*
	        Устанавливаем ссылку на родительский компонент по умолчанию
	        */
	        this.$parent = false;

	        /*
	        Устанавливаем ссылки на дочерние компоненты по умолчанию
	        */
	        this.$childs = {};

	        /*
	        Устанавливаем пямять для запросов к данным scope.
	        Используется для кеширования тех запросов, что уже были созданы и позволяет
	        отсеивать дублирубщие запросы.
	        */
	        this.$scopeSnaps = {};

	        /*
	        Привязываем элемент к его контроллеру
	        */
	        this.$element = element;

	        /*
	        Привязываем образ компонента к самому себе
	        */
	        this.component = component;


	        /*
	        Привязываем контроллер к его элементу
	        Достигаем обратного связывания
	        */
	        Object.defineProperty(element, 'synthetic', {
	            enumerable: false,
	            writable: false,
	            configurable: false,
	            value: this
	        });

	        /*
	        Создаем основное системное конфигурационное свойство
	        */
	        Object.defineProperty(this, '__config__', {
	            enumerable: false,
	            writable: false,
	            configurable: true,
	            value: mixin({
	                allWaitingForResolve: false, // Используется при инициализации angular
	                $$angularInitialedStage: 0, // Этап инициализации angular
	                $$angularDirectived: false, // Поддерживает ли этот элемент директива angular
	                createdEventFires: false, // Произошло ли событие created
	                attachedEventFires: false, // Произошло ли событие attached
	                templateModulePrototype: false, // Класс, которым автоматичнески расширяется модуль шаблона
	                rendered: false // Произведен ли рендеринг элемента TODO: проверить факт юзабельности
	            })
	        });

	        /*
	        If angulal not ready hide element
	        */
	        if ("undefined"===typeof Synthetic.$$angularApp) {
	            element.style.opacity = 0;
	            Synthetic.bind('angularBootstraped', function() {
	                element.style.opacity = 1;
	            });
	        };

	            

	        /*
	        Создаем базовый scope
	        */
	        this.$$scope = {
	            attributes: {}, // Содержит все аттрибуты элемента
	            properties: {}, // Содержит все аттрибуты data-*
	            $config: {},
	            $shadowTemplate: null,
	            uid: 'syntheticElement'+Math.round(Math.random()*10000)
	        };

	        /*
	        Создаем доступное свойство scope, которое назависимо от используемого движка
	         вернет текущий scope
	        */
	       
	        Object.defineProperty(this, '$scope', {
	            enumberable: true,
	            get: function() {
	                return self.$injectors[0].$scope;
	            }
	        });

	        /*
	         Создаем коллекцию инжекторовы
	         */
	        Object.defineProperty(this, '$injectors', {
	            enumerable: false,
	            writable: false,
	            configurable: true,
	            value: [
	                {
	                    $scope: this.$$scope,
	                    $element: element,
	                    $self: this,
	                    $component: component,
	                    $generator: null, // Инициализируем генератор
	                    $stock: {},
	                    $config: function(properties, callback) {
	                        debugger;
	                        self.$fetch('$config', properties, self.$deploy(callback));
	                    },
	                    $setup: function(data) {
	                        self.$employ(function() {
	                            extend(self.$scope.$config, data);
	                        });
	                    },
	                    $warning: function() {
	                        console.warn.apply(console, arguments);
	                    }
	                }
	            ]
	        });

	        this.$generator = new Generator(this);
	        this.$injectors[0].$generator = this.$generator;

	        /*
	        Inherit component th-injectors to scope-injects list
	        */
	        this.$polyscope.injects = this.$polyscope.injects.concat(this.$injectors);

	        /*
	        Комплекс действий по инициализации angular, произойдет это только в том случае если в опциях
	        компонента указано, что он должен использовать angular
	        */
	        if ("object"===typeof angular&&angular.bootstrap&&component.engine.name==='angular') {
	            

	            var $self = this;

	            // TODO: Depricate
	            // this.$$angularControllerName = 'singular'+(new Date()).getTime()+Math.round(Math.random()*10000);

	            /*
	             Нам наобходимо отслеживать этапы инициализации директивы, покрайней мере на этапе форматирования
	             схемы функционирования интеграции с angular
	             */
	            this.__config__.$$angularInitialedStage = 1;
	            /*
	             Устанавливаем для директивы событие, которое компонент будет ожидать прежде чем продолжить инициализацию.
	             Когда событие angularResolved сработает в scope будут импортированы свойсвта системного scope, а так же
	             будут перенесены системные watchers в angular.
	             */
	            this.__config__.allWaitingForResolve = 'angularResolved';

	            /*
	             Ручная инициализация первого компонента.

	             Поскольку наш angular инициализируется не сразу, корневой контроллер может не инициализироваться
	             самостоятельно, поэтому нам следует его инициализировать форсировано.

	             TODO: Следует внимательно рассмотреть необходимость этой меры, перед созданием beta-релиза.
	             */
	            if (Synthetic.$$angularBootstraped) Synthetic.$$angularTimeout(function() {

	                if ($self.$destroyed) return;

	                if (!$self.__config__.$$angularDirectived&&$self.__config__.$$angularInitialedStage<2) {

	                    try {
	                        Synthetic.$$angularCompile($self.$element)(angular.element($self.$element).scope());
	                    } catch(e) {
	                        try {
	                            /*
	                            Если мы попали сюда, то вероятно объект был создан в корне дерева, нам нужно создать
	                            для него scope самостоятельно
	                            */
	                            Synthetic.$$angularCompile($self.$element)(Synthetic.$$angularRootScope.$new());
	                        } catch(e) {
	                            console.error('Angular fatal error. Scope is not created.', e, $self.$element);
	                        }
	                    }
	                }

	            });
	        }

	        /*
	        Собираем дерево элементов в $scope
	        */
	        for (var i = 0;i<element.childNodes.length;++i) {
	            if (element.childNodes[i].nodeType===1) {
	                /*
	                 DEPRICATED: пока что этот функционал не используется и не протестирован
	                 */
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

	                    //this.$injectors.$scope.html[camelize(element.childNodes[i].tagName.toLowerCase())] = element.childNodes[i].innerHTML;
	                }
	            } else if (element.childNodes[i].nodeType===8) {
	                /*
	                 Анализируем контент тэга по предмет поиска коммент-data.
	                 */
	                var nv = element.childNodes[i].nodeValue.trim();

	                if (nv.substr(0,9)==='template:') {
	                    this.$$scope.$shadowTemplate = nv.substr(9);
	                }
	            }
	        }

	        /*
	        Пришло время работать с preset
	        */
	        var presets = ['@'],
	        userPreset = element.getAttribute('preset');

	        if (userPreset!==null&&userPreset.charAt(0)!=='{') {
	            presets.push(userPreset);
	        }

	        /*
	        Отмечаем выделенные preset как отработанные
	        */
	        for (var i = 0;i<presets.length;++i) {
	            component.presets[presets[i]].performed = true;
	        }

	        /*
	        Начинаем наблюдение за переменной preset
	        */
	        var watchPresetValue = function() {
	            self.$watch('attributes.preset', function(preset) {
	                if (!preset) return;
	                if (!component.presets[preset].performed) {
	                    for (var prop in presetImport) {
	                        if (presetImport.hasOwnProperty(prop))
	                        component.$usePreset(presets, presetImport[prop], this);
	                    }
	                }
	            });
	        };
	        if (!this.$parent) {
	            this.bind('parentDefined', function() {
	                watchPresetValue();
	            }, true);
	        } else {
	            watchPresetValue();
	        }
	        
	        /*
	        Анализ опции, указывающей на то как поступить с родным innerHtml элемента
	        */
	        component.$usePreset(presets, presetImport['presetImportDefaults'], this);

	        /*
	        Ожидаем инициализации движка
	        */
	        this.$queue(function() {
	            /*
	            На данном этапе мы уже должны обязательно подготовить данные о $parent
	            */
	            var pe = this.$element.parentNode;

	            while (!(pe === null || "undefined" !== typeof pe.synthetic)) {
	                pe = pe.parentNode;
	            }

	            this.$parent = (pe !== null && "object" === typeof pe.synthetic) ? pe.synthetic : false;
	            /*
	            Регистрируем себя в parentComponent
	            */
	            if (this.$parent) {
	                this.$parent.$$registerChild(this);
	                this.trigger('parentDefined');
	            }

	            if (!~this.$element.className.split(' ').indexOf('synt-loaded'))
	                this.$element.className+=' synt-loaded';

	            /*
	            Культивируем аттрибуты
	            */
	            for (var z = 0; z < element.attributes.length; z++) {
	                var value = getNonScopeValue(element.attributes[z].value);
	                this.$scope.attributes[camelize(element.attributes[z].name)] = value;
	                if (element.attributes[z].name.substr(0,5)==='data-') {

	                    this.$scope.properties[camelize(element.attributes[z].name.substr(5))] = value;
	                }
	            }

	            /*
	            Преобраузем прототип компонента c применем inject
	            */
	            component.$usePreset(presets, presetImport['presetImportPrototype'], this);

	            /*
	            Отправляем событие created
	            */
	            this.trigger("created", [ this.element ]);
	            this.__config__.createdEventFires = true;
	            
	            component.$usePreset(presets, presetImport['presetImportCallbacksAction'], this);


	            /*
	            Анонимная evalWatchers поможет начать наблюдение за scope в нужный момент
	            */
	            var evalWatchers = function() {
	                component.$usePreset(presets, presetImport['presetImportWatchers'], self);
	            }

	            /*
	            Задерживаем выполнение наблюдателей до момента инициализации нашего местоположения
	            */
	            if (!this.$parent) {
	                this.bind('parentDefined', function() {
	                    evalWatchers.call(this);   
	                }, true);
	            } else {
	                evalWatchers.call(this);
	            }

	            
	            this.trigger("rendered", [this.$element]);
	            this.__config__.rendered = true;
	        });

	    }.inherit(WebElementPrototype);

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	
		var getObjectByXPath = __webpack_require__(22);
		var smartCallback = __webpack_require__(4);
		var classEvents = __webpack_require__(3);
		var getNonScopeValue = __webpack_require__(23);
		var Box = __webpack_require__(24);
		var camelize = __webpack_require__(5);
		var dasherize = __webpack_require__(25);
		var Scope = __webpack_require__(26);
		__webpack_require__(16);

		/*
		Модифицируем стандартный classEvents
		*/
		module.exports = function() {
			/*
			Этот массив содержит объекты с методом unwatch на каждое из наблюдений
			*/
			this.$watchersHistory = [];
			/*
			Очередь лидеров на изменение свойств $scope
			*/
			this.$applyLeaders = {};
			/*
			Hitchers
			*/
			this.$hitchers = {};
			/*
			Config
			*/
			this.$config = {};
			/*
			Tuning up Polyscope
			*/
			this.$polyscope.customization.watchExprRouters = [
				/*
				Callback attachers
				*/
				{
					match: /^(attributes\.|properties\.)/,
					replace: false,
					overrideMethod: function(expr, callback, bitoptions) {
						var self = this, sharing = /^(attributes|properties)\./.exec(expr);
						expr = expr.replace(/^(attributes\.|properties\.)/, '');
						var attrn = sharing[1]==='properties'?'data'+expr.charAt(0).toUpperCase()+expr.substr(1):expr,
						value;
							
						var unwatcher = function(attrn, i) {
								this[attrn][i] = null;
							}.bind(self.$$attrsWatchers, attrn, self.$$attrsWatchers[attrn] ? self.$$attrsWatchers[attrn].length : 0);
						self.$watchersHistory.push({
							"unwatch": unwatcher
						});
						
						if ("object"!==typeof self.$$attrsWatchers[attrn]) {
							self.$$attrsWatchers[attrn] = [];
							/*
							Если такой аттрибут еще никогда не отслеживался, мы должны немедленно проверить его значение, но только 
							в случае, если событие attached уже случилось
							*/
							
							if (self.__config__.attachedEventFires) { 
								var dashed = dasherize(attrn), 
								value = self.$element.getAttribute(dashed); 
								if (null===value) value = Synthetic.config.undefinedAttributeDefaultValue;
								
								self.$scope.attributes[attrn] = value; 
								if (dashed.substr(0, 5) === "data-") { 
									self.$scope.properties[camelize(dashed.substr(5))] = value; 
								} 

								callback.apply(self, !!((bitoptions||0) & POLYSCOPE_DITAILS) ?  [value, value, Synthetic.config.undefinedAttributeDefaultValue] : [value]);
							} else { 
								self.bind("attached", function() { 
									var dashed = dasherize(attrn), 
									value = self.$element.getAttribute(dashed); 
									if (null===value) value = Synthetic.config.undefinedAttributeDefaultValue;
									
									self.$scope.attributes[attrn] = value; 
									if (dashed.substr(0, 5) === "data-") { 
										self.$scope.properties[camelize(dashed.substr(5))] = value; 
									} 
									callback.apply(self, !!((bitoptions||0) & POLYSCOPE_DITAILS) ?  [value, value, Synthetic.config.undefinedAttributeDefaultValue] : [value]);
								}, true); 
							}
						}
						var attrOnChangeCallback;
						attrOnChangeCallback = function(old, action, value) {
							attrOnChangeCallback.last = [old, action, value];
							callback.apply(self, !!((bitoptions||0) & POLYSCOPE_DITAILS) ?  [value, value, old] : [value]);
						};
						self.$$attrsWatchers[attrn].push(attrOnChangeCallback);

						return {
							destroy: unwatcher
						};
					}
				},
				/*
				Watch using angular engine
				*/
				{
					match: true,
					replace: false,
					overrideMethod: function(expr, callback, bitoptions) {
						var self = this;
						/*
						Проверка задержки
						*/
						if (self.__config__.allWaitingForResolve) {

							/*
							В случае, если система ожидает инициализации какого то приложения,
							функции прослушивания переменных задерживаются до инициализации
							*/
							var unwatcher = self.$queue(function(args) {
								unwatcher = (self.$watchExpr.apply(self, args)).destroy;
							}.bind(self, arguments));

							return {
								destroy: function() {
									unwatcher.apply(self, arguments);
								}
							}
						}
						callback.watcher = {
							last: Synthetic.config.undefinedAttributeDefaultValue,
							diff: Synthetic.config.undefinedAttributeDefaultValue
						};
						callback.watcher.destroy = self.$scope.$watch(expr, function(value) {
							
							callback.watcher.diff = !!(bitoptions & POLYSCOPE_DITAILS) ? self.$$scopeDeepCompare(callback.last, newValue) : value;
							var last = callback.watcher.last;
							callback.watcher.last = value;
							callback.apply(self, !!(bitoptions||0 & POLYSCOPE_DITAILS) ?  [value, callback.watcher.diff, last] : [value]);
						}, !!(bitoptions||0 & POLYSCOPE_DITAILS) && !!(bitoptions||0 & POLYSCOPE_COMPARE));

						return callback.watcher;
					}
				}
			];

			/*
			Supports angular compatibility
			*/
			this.$polyscope.customization.digestEmploymentsRoutes = [{
				match: function(object) { // Angular has method $evalAsync
					return "function"===typeof object.$evalAsync;
				},
				overrideMethod: function(object) {
					object.$evalAsync();
				}
			}];

			/*
	        Inherit component th-injectors to scope-injects list
	        */
	        this.$polyscope.injects.push(function() {
	        	return {$box: new Box()}
	        });

			this.$$applyPortions = {
				applies: [],
				timer: 0
			}
		}
		.inherit(classEvents)
		.inherit(Scope)
		.proto({
			$read: function() {

				var attrn;
				/*
				Проверка задержки
				*/
				if (this.__config__.allWaitingForResolve) {

					/*
					В случае, если система ожидает инициализации какого то приложения,
					функции прослушивания переменных задерживаются до инициализации
					*/
					this.$queue(function(args) {
						this.read.apply(this, args);
					}.bind(this, arguments));
					return;
				}

				var self=this,objectXPath=false, properties, callback;
				;(arguments.length>2) ? (objectXPath=arguments[0],properties=arguments[1],callback=arguments[2]) : (properties=arguments[0],callback=arguments[1]);

				/*
				Формируем полные пути свойств
				*/
				var xpath = objectXPath?objectXPath.split('.'):[];
				var requiredProperties = [];

				if ("object"!==typeof properties) properties = [properties];
				
				for (var i = 0;i<properties.length;++i) {
					requiredProperties.push(xpath.concat(properties[i].split('.')));
				}

				var alldata = [];
				if (self.$component.engine.name==='angular'&&Synthetic.$$angularApp)
				{
					for (var x = 0;x<requiredProperties.length;++x) {
						
						if (requiredProperties[x][0]==='properties'||requiredProperties[x][0]==='attributes') {
							attrn = requiredProperties[x][0]==='properties'?'data'+requiredProperties[x][1].charAt(0).toUpperCase()+requiredProperties[x][1].substr(1):requiredProperties[x][1];
							
							alldata.push(getNonScopeValue(self.$element.getAttribute(dasherize(attrn))));
						} else {
							alldata.push(getNonScopeValue(self.$scope.$eval(requiredProperties[x].join('.'))));
						}
					}
				} else {
					for (var x = 0;x<requiredProperties.length;++x) {
						alldata.push(getNonScopeValue(getObjectByXPath(self.$scope, requiredProperties[x])));
					}
				}


				/*
				Если наблюдение происходит на несколькими переменными одновременно, то 
				срабатывание функции обработчика будет происходит каждый раз когда одна из 
				переменных изменится. Но когда это изменение происходит по эвенту инициализации
				мы получим такой результат, когда функция обработчик будет вызвана несколько раз с
				одними и теми же данными. Что бы это предотвратить необходимо сравниваться предыдущее
				состояние ответа с новым. И если они равны, то вызов callback производится не будет.
				*/
				var jstr = JSON.stringify(alldata),rstr=JSON.stringify(requiredProperties);

				/*
				Если предыдущий ответ точно соответствует теукущему, то мы его игнорируем.
				*/
				if (self.$scopeSnaps[rstr]&&jstr===self.$scopeSnaps[rstr]) { return; }
				self.$scopeSnaps[rstr] = jstr;
				
				
				if (callback.$$injected)
				callback.apply(self, alldata);
				else
				self.$inject(callback).apply(self, alldata);
			},
			/*
			Old method of watching with angular compatible
			*/
			$watchAngular: function() {
				var self = this;
				/*
				Проверка задержки
				*/
				if (this.__config__.allWaitingForResolve) {

					/*
					В случае, если система ожидает инициализации какого то приложения,
					функции прослушивания переменных задерживаются до инициализации
					*/
					var unwatcher = this.$queue(function(args) {
						unwatcher = this.$watch.apply(this, args);
					}.bind(this, arguments)),
					here=this;

					return function() {
						unwatcher.apply(here, arguments);
					}
				}

				/*
				Start watching ***
				*/
				var self=this,objectXPath=false, properties, callback, callbackIndex=1,watchArguments=arguments;
				;(arguments.length>2) ? (objectXPath=arguments[0],properties=arguments[1],callback=arguments[2],callbackIndex=2) : (properties=arguments[0],callback=arguments[1]);
				
				if (!(properties instanceof Array)) properties = [properties];

				/*
				Формируем полные пути свойств
				*/
				var xpath = objectXPath?objectXPath.split('.'):[];
				var requiredProperties = [];
				
				for (var i = 0;i<properties.length;++i) {
					requiredProperties.push(xpath.concat(properties[i].split('.')));
				}

				
				var lastTrack = {}; // Последнее состояние срабатываения
				var ownBox = new Box();
				/*
				Начинаем наблюдение за переменной
				*/
				var getDatas = function(requiredProperties, rprops, $unwatcher) {
					
					var injectedCallback = self.$inject(callback, {
						$unwatch: $unwatcher,
						$box: ownBox
					});

					injectedCallback.$$injected = true;

					/*
		            Если рендеринг уже произошел, то нам, помимо наблюдения, необходимо выполнить чтение немедленно,
		            что бы обработка данных могла произойти не дождидаясь их изменения. Это нужно потому что
		            к моменту рендеринга как правило все данные уже устанавлиаются и простое выполнение watch
		            не вызовет callback.
		            */
		            if (self.__config__.rendered) {
			            var exportArguments = Array.prototype.slice.apply(watchArguments);
			            exportArguments[callbackIndex] = injectedCallback;
			            self.$read.apply(self, exportArguments);
			        }

					return function(prop, action, newValue) {
						
						var alldata = [];
						for (var x = 0;x<requiredProperties.length;++x) {
							if (rprops===requiredProperties[x]) {
								alldata.push(getNonScopeValue(newValue));
							}
							else {
								if (self.component.engine.name==='angular'&&Synthetic.$$angularApp) {
									alldata.push(getNonScopeValue(self.$scope.$eval(requiredProperties[x].join('.'))));
								} else {
									alldata.push(getNonScopeValue(getObjectByXPath(self.$scope, requiredProperties[x])));
								}
							}
						}

						/*
						Если наблюдение происходит на несколькими переменными одновременно, то 
						срабатывание функции обработчика будет происходит каждый раз когда одна из 
						переменных изменится. Но когда это изменение происходит по эвенту инициализации
						мы получим такой результат, когда функция обработчик будет вызвана несколько раз с
						одними и теми же данными. Что бы это предотвратить необходимо сравниваться предыдущее
						состояние ответа с новым. И если они равны, то вызов callback производится не будет.
						*/
						var jstr = JSON.stringify(alldata),rstr=JSON.stringify(requiredProperties);
						
						/*
						Если предыдущий ответ точно соответствует теукущему, то мы его игнорируем.
						*/
						if (self.$scopeSnaps[rstr]&&jstr===self.$scopeSnaps[rstr]) { return; }
						self.$scopeSnaps[rstr] = jstr;
						
						injectedCallback.apply(self, alldata);
					}
				};

				/* !!!!!!!!!!!!!!!!!!
				ЭТОТ КОД ВЫПОЛНЯЛ ФУНКЦИЮ ПЕРВИЧНОГО ВЫЗОВА СОБЫТИЯ ИЗМЕНЕНИЯ ОБЪЕКТА (НАЧАЛО)
				НО ЭТО СОБЫТИЕ СРАБАТЫВАЕТ И ТАК. В AGNULAR JS СОБЫТИЕ СРАБАТЫВАЕТ ПРИ ИНИЦИАЛИЗАЦИИ $SCOPE
				КОГДА МЫ КОПИРУЕМ В НЕГО СУЩЕСТВУЮЩИЕ ДАННЫЕ. ПОЭТОМУ ЭТОТ БЛОК ДОЛЖЕН БЫТЬ АКТУАЛЬНЫМ ТОЛЬКО 
				ДЛЯ ДЕФОЛТНОГО ВОЧЕРА
				
				*/
				//if (!Synthetic.$$angularApp) { 
					//getDatas.call(self, requiredProperties, false).call(self);
				//}

				var watchFabric = function(rprops, wobject, prop) {
					
					if ("undefined"===typeof wobject[prop]) wobject[prop] = Synthetic.config.undefinedAttributeDefaultValue;

					// Обнуляем snaps
					if ("undefined"===typeof self.$scopeSnaps[JSON.stringify(requiredProperties)]) self.$scopeSnaps[JSON.stringify(requiredProperties)] = false;

					if (self.component.engine.name==='angular'&&Synthetic.$$angularApp) { //&&self.__config__.$$angularInitialedStage>1

						
							var compiledCallbacker;

							/*
							Что бы ускорить работу вочеров при обращении к аттрибутом, помимо вочеров angular мы дополняем их собственными
							вочерами, основанными на событиях.
							Вметсе с этой методом прослушивания создается и функция самоуничтожения
							TODO: придумать другой способ самоуничтожения, отличный от null
							*/
							if (rprops[0]==='properties'||rprops[0]==='attributes') {
								
								var attrn = rprops[0]==='properties'?'data'+rprops[1].charAt(0).toUpperCase()+rprops[1].substr(1):rprops[1];
								
								var unwatcher = function(attrn, i) {
										this[attrn][i] = null;
									}.bind(self.$$attrsWatchers, attrn, self.$$attrsWatchers[attrn] ? self.$$attrsWatchers[attrn].length : 0);
								self.$watchersHistory.push({
									"unwatch": unwatcher
								});
								compiledCallbacker = getDatas(requiredProperties, rprops, unwatcher);
								if ("object"!==typeof self.$$attrsWatchers[attrn]) {
									self.$$attrsWatchers[attrn] = [];
									/*
									Если такой аттрибут еще никогда не отслеживался, мы должны немедленно проверить его значение, но только 
									в случае, если событие attached уже случилось
									*/
									
									if (self.__config__.attachedEventFires) { 
										var dashed = dasherize(attrn), 
										value = self.$element.getAttribute(dashed); 
										if (null===value) value = Synthetic.config.undefinedAttributeDefaultValue;
										compiledCallbacker.call(self, false, "set", value); 
										self.$scope.attributes[attrn] = value; 
										if (dashed.substr(0, 5) === "data-") { 
											self.$scope.properties[camelize(dashed.substr(5))] = value; 
										} 
									} else { 
										self.bind("attached", function() { 
											var dashed = dasherize(attrn), 
											value = self.$element.getAttribute(dashed); 
											if (null===value) value = Synthetic.config.undefinedAttributeDefaultValue;
											compiledCallbacker.call(self, false, "set", value); 
											self.$scope.attributes[attrn] = value; 
										if (dashed.substr(0, 5) === "data-") { 
											self.$scope.properties[camelize(dashed.substr(5))] = value; 
										} 
										}, true); 
									}
								}
								self.$$attrsWatchers[attrn].push(compiledCallbacker);

								

							} else {
								var unwatcher = self.$scope.$watch(rprops.join('.'), function(newValue) {
									try {
										compiledCallbacker.call(self, false, 'set', newValue, unwatcher);
									} catch(e) {
										setTimeout(function() {
											compiledCallbacker.call(self, false, 'set', newValue, unwatcher);
										});
									}
								});
								compiledCallbacker = getDatas(requiredProperties, rprops, unwatcher);
							}
							
							

							self.$watchersHistory.push({
								"unwatch": unwatcher
							});
						
						if ("function"!==typeof unwatcher) debugger;

						return unwatcher;
					} else {

						throw 'WATCH NON ANGULAR VALUE IS NOT SUPPORTED ON THIS VERSION'
					};
				};
				var unwacthers = function() { "empty unwatcher"; }; // Эта функция будет содержат функции для уничтожения наблюдений
				
				for (var i = 0;i<requiredProperties.length;++i) {

					unwacthers = unwacthers.inherit(watchFabric(requiredProperties[i], getObjectByXPath(this.$scope, requiredProperties[i].slice(0, requiredProperties[i].length-1)), requiredProperties[i][requiredProperties[i].length-1]));
				}
				return unwacthers;
			},
			/*
			Анализирует пользовательскую функцию и внедряет в нее системные аргументы. Так например
			function($scope) {} - передаст в функцию $scope компонента
			Родные аргументы смещаются вправо
			В случае интеграции с angularjs функция так же обертывается в $timeout
			*/
			$inject: function(callback, $injectors) {
				
				if (Synthetic.$$angularApp&&this.__config__.$$angularScope&&this.__config__.$$angularInitialedStage>1) {
					var self = this, injected = smartCallback.call($injectors ? ([]).concat(self.$injectors, $injectors) : self.$injectors, callback, self);
					return function() {
						var nargs = Array.prototype.slice.apply(arguments),context=this;
						return injected.apply(context, nargs);
					}				
				} else {
					return smartCallback.call("object"===typeof $injectors ? ([]).concat(this.$injectors, $injectors) : this.$injectors, callback, this);
				}
				
			},
			/*
			Функция сочитающая в себя 3 мощных механизма:
			- injector
			- digest
			- hitch

			$employ нужно использовать в задачах связанных конкретно с данным элементом
			*/
			$employ: function(callback) {
				return this.$eval(this.$inject(callback));
			},
			/*
			Фабрикует функцию, сочитающую в себе 3 мощных механизма:
			- injector
			- apply

			В отличии от $employ запускает глобальный цикл, который запускается от самого корневого элемента.
			$deploy необходимо использовать в глобальных операциях.

			* Функция не выполняет callback автоматически
			*/
			$deploy: function(callback) {
				var self = this;
				return function() {
					var args = Array.prototype.slice.apply(arguments);
					return self.$apply(function() {
						debugger;
						return self.$inject(callback).apply(this, args);
					});				
				}
			},
			/*
			Inject с автозапуском
			*/
			$run: function(cb) {
				return this.$inject(cb)();
			},
			/*
			Добавляет функцию в очередь. Она будет выполнена когда компонент будет
			готов принимать обработчики и вочеры.
			*/
			$queue: function(callback) {
				var self = this;
				if (this.__config__.allWaitingForResolve) {
					/*
					Модификация возврата дестроера на наблюдатель из версии sag, вместо this.bind используется this.on возвращающий собственный дестроер;
					Это модификация не проверена тестами.
					*/
					return this.$on(this.__config__.allWaitingForResolve, function() {
						if (self.$destroyed) return false;
						callback.apply(this, arguments);
					}, true);
				} else {

					callback.apply(this);
					return function() { }
				}
			},
			$digestAngular: function(expr) {

				this.$scope.$evalAsync(expr);
			},
			$applyAngular: function($as, callback, destructor){
				/*
				Вызов функцции может быть перегружен тремя объектами сразу
				0 - свойство scope
				1 - функция apply
				2 - деструктор преинициализации

				Или же функция может принять только один аргумент - функция apply
				*/
				;(arguments.length===1) && (callback=$as,$as=false,destructor=false);

				if ($as) {
					if (this.$applyLeaders[$as]) {
						/*
						Предотвращает выполнение предыдущего apply
						*/
						this.$applyLeaders[$as]();
					}

					var allowApply = true, component = this,
					/*
					Функция запрещающая выполнение $apply, вызывается
					если по отношению к этому expression применен еще 
					один $apply
					*/
					allowDestructor = function() {
						allowApply = false;
						delete component.$applyLeaders[$as];
						if ("function"===typeof destructor) destructor();
					},
					boundApply = this.$inject(callback),
					realCallback = function() {
						if (allowApply) {
							delete component.$applyLeaders[$as];
							return boundApply();
						}
						return false;
					};
					this.$applyLeaders[$as] = allowDestructor;
				} else {
					var realCallback = this.$inject(callback);
				}

				

				if (this.component.engine.name==='angular'&&Synthetic.$$angularApp)
				this.$scope.$applyAsync(realCallback);
				else
				setTimeout(realCallback);
			},
			
			$template: function(content) {
				return this.$generator.template(content);
			},
			/*
			Принудительно выполняет действия связанные с deatch
			*/
			$detach: function() {

				this.__config__.allWaitingForResolve = 'attached';
	            this.__config__.attachedEventFires = false;

	            /*
				Если у модуля есть темплейт, мы должны произвести дестрой его модуля
	            */
	            this.$generator.destroy();

	            this.trigger("detached", [ this.synthetic ]);
			},
			$destroy: function() {
				
				if (this.$destroyed) return true;
				this.trigger('$destroy');
				this.$destroyed = true;
				/*
				Удаляем себя из списка чилдов родительского компонента
				*/
				if (this.$parent) {
					this.$parent.$$unRegisterChild(this);
				}
				/*
				Запускаем destroy функцию собственных надстроек
				*/
				if ("function"===typeof this.destroy) {
					this.destroy();
				}
				/*
				Очищаем события встроенным в classEvent методом clearEventListners
				*/
				this.clearEventListners();
				/*
				Очищаем watchers через crossEngine метод unwatch коллекции watchersHistory
				*/
				for (var i = 0;i<this.$watchersHistory.length;++i) {
					if (this.$watchersHistory[i]!==null) {
						this.$watchersHistory[i].unwatch();
					}
				}

				/*
				Очищаем hitchers
				*/
				for (var i in this.$hitchers) {
					if (this.$hitchers.hasOwnProperty(i)&&"function"===typeof this.$hitchers[i]) {
						this.$hitchers[i].call(this);
					}
				}
				
				/*
				Удаляем generator
				*/

				this.$generator.destroy();
				this.$generator = null;
				/*
				Удаляем привязку объекта к элементу
				*/
				this.$element.synthetic = null;
				/*
				Очищаем собственные данные конфигурации
				*/
				this.__config__ = {};
				/*
				Удаляем элемент DOM, если он еще существует
				*/
				if (this.$element&&this.$element.parentNode!==null) {
					this.$element.parentNode.removeChild(this.$element);
				}
			},
			/*
			Данная функция выполняет некую процедуру, остаточные объектвы которые будут удалены
			возвращаемой функцийей
			*/
			$hitch: function(cb, keys) {
				var fkey = cb.toString()+("object"===typeof keys ? JSON.stringify(keys) : (keys ? keys.toString() : '') );
	            if ("function"===typeof this.$hitchers[fkey]) this.$hitchers[fkey].call(this);
	            this.$hitchers[fkey] = this.$inject(cb).apply(this, keys instanceof Array?keys:[]);
	            return function(i) {
	                this.$hitchers[i].call(this); delete this.$hitchers[i];
	            }.bind(this, fkey)
			},
			/*
			Регистрирует новый child
			*/
			$$registerChild: function($ctrl) {
				this.$childs[$ctrl.$sid] = $ctrl;
				return this;
			},
			/*
			Анулирует child
			*/
			$$unRegisterChild: function($ctrl) {
				if (this.$childs[$ctrl.$sid]) {
					delete this.$childs[$ctrl.$sid];
				}
				return this;
			}
		});

/***/ },
/* 22 */
/***/ function(module, exports) {

	module.exports = function(start, xpath) {
		
		for (var i = 0;i<xpath.length;++i) {
			if ("object"!==typeof start) return false;
			if ("undefined"===typeof start[xpath[i]]) return false;
			start=start[xpath[i]];
		}

		return start;
	};

/***/ },
/* 23 */
/***/ function(module, exports) {

	module.exports = function(newValue) {
		// TODO: can we call this staff only when data is compiled???
		//if (/^{{[^}}]*}}$/.test(newValue)) console.error('Scopes detected', newValue);
		return /^{{[^}}]*}}$/i.test(newValue)||newValue===undefined ? undefined : newValue;
	};

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(1);

	module.exports = function(handler) {
			this.data = {};
			this.stashed = {};
			this.shot = '';
			this.handler = null
			this.context = window;
			
		}.proto({
			initHandler: function(handler, context) {
				if (null===this.handler) {
					this.handler = handler;
					this.context = context;
				}
			},
			get: function(prop) {
				return this.data[prop];
			},
			lookup: function() {
				var data={},diff=false;
				;(arguments.length>1 ? (data={},data[arguments[0]]=arguments[1]) : (data=arguments[0]));
				
				for (var prop in data) {
					if (data.hasOwnProperty(prop)) {
						if (typeof this.stashed[prop] !== typeof data[prop]) diff=true;
						else if (this.stashed[prop]!=data[prop]) diff=true;
						else if ("object"===typeof this.stashed[prop]) {
							if (JSON.stringify(this.stashed[prop])!==JSON.stringify(data[prop])) diff=true;
						}
						this.stashed[prop] = data[prop];
					}
				}
				return diff;
			},
			set: function() {

				var data={},diff=false;
				;(arguments.length>1 ? (data={},data[arguments[0]]=arguments[1]) : (data=arguments[0]));
				
				for (var prop in data) {
					if (data.hasOwnProperty(prop)) {
						if (this.data[prop]!=data[prop]) diff=true;
						this.data[prop] = data[prop];
					}
				}
				return diff;
			},
			/*
			Аналогичен set, но присванивание произовдится лишь один раз при старте.
			Повторное присваивание не производится
			*/
			init: function() {
				var data={};
				;(arguments.length>1 ? (data={},data[arguments[0]]=arguments[1]) : (data=arguments[0]));

				for (var prop in data) {
					if (data.hasOwnProperty(prop)) {
						if ("undefined"!==typeof this.data[prop]) continue;
						this.data[prop] = data[prop];
					}
				}
			},
			$apply: function() {

				this.set.apply(this, arguments);
				this.diffRun();
			},
			diffRun: function() {
				var stringified = JSON.stringify(this.data);
				if (this.shot!==stringified) {
					this.run();
				};
				this.shot = stringified;
			},
			run: function() {
				this.handler.call(this.context, this.data);
			}
		});

/***/ },
/* 25 */
/***/ function(module, exports) {

	module.exports = function(text) {
		return text.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
	};

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(16);
	var Promises = __webpack_require__(7).Promises,
	    extend = __webpack_require__(15),
	    clone = function(o) {
	        return extend(true, {}, o);
	    },
	    compareObjects = __webpack_require__(27),
	    inject = __webpack_require__(13).inject,
	    dataSnap = function(data) {
	        var snap;
	        if ("object"===typeof data && null!==data) {
	            try {
	                snap = JSON.stringify(data); // Lite JSON method to take smapshot
	            } catch(e) {
	                snap = extend(true, {}, data); // Heavy method for recrussive objects
	            }
	        } else if (null===data || undefined===data) {
	            snap = data;
	        } else {
	            snap = data.toString()
	        }

	        return snap;
	    },
	    bitPush = function(bitNumber, mask) {
	        if (!(bitNumber & mask)) bitNumber = bitNumber | mask;
	        return bitNumber;
	    }

	// Set global constants
	POLYSCOPE_DEFAULT = 1 << 0;
	POLYSCOPE_WATCH = 1 << 1;
	POLYSCOPE_ONCE = 1 << 2;
	POLYSCOPE_DEEP = 1 << 3;
	POLYSCOPE_DITAILS = 1 << 4;
	POLYSCOPE_COMPARE = 1 << 5;
	POLYSCOPE_ARRAYRESULT = 1 << 10;

	var flagsFndRegExpr = /^([?+]+)/;


	var Scope = function($$parent) {
	    Object.defineProperty(this, '$$digestRequired', {
	        enumerable: false,
	        writable: true,
	        configurable: false,
	        value: false
	    });

	    Object.defineProperty(this, '$$digestInProgress', {
	        enumerable: false,
	        writable: true,
	        configurable: false,
	        value: false
	    });

	    Object.defineProperty(this, '$$watchers', {
	        enumerable: false,
	        writable: true,
	        configurable: false,
	        value: []
	    });
	    
	    Object.defineProperty(this, '$$digestInterationCount', {
	        enumerable: false,
	        writable: true,
	        configurable: false,
	        value: 0
	    });
	    
	    /*
	    Link to parent scope
	    */
	    Object.defineProperty(this, '$$parentScope', {
	        enumerable: false,
	        writable: true,
	        configurable: false,
	        value: false
	    });
	    /*
	    List of childScopes
	    */
	    Object.defineProperty(this, '$$childScopes', {
	        enumerable: false,
	        writable: true,
	        configurable: false,
	        value: []
	    });
	    /*
	    Polyscope
	    */
	    Object.defineProperty(this, '$polyscope', {
	        writable: false,
	        enumerable: false, 
	        configurable: false,
	        value:  {
	            customization:{
	                /*
	                 Engine of watchExpr. It allows you to control methods and options of watch and parse process
	                 ```
	                 {
	                 match: /^scope\./,
	                 replace: /^(scope)/,
	                 scope: someobject,
	                 overrideMethod: function(expr, callback, bitconfig) { ... }
	                 }
	                 ```
	                 */
	                watchExprRouters: [],
	                /*
	                 Implict method this.$$childScopes[i].$digest();
	                 Structore of route is
	                 {
	                 match: function(child) { },
	                 overrideMethod: function(child) { ... }
	                 }
	                 */
	                digestEmploymentsRoutes: []
	            },
	            /*
	             List of injects for API methods
	             */
	            injects: []
	        }
	    });

	    /* Set parent scope */
	    if ("object"===typeof $$parent) {
	        this.$$parentScope = $$parent;
	        if ($$parent.$$childScopes instanceof Array) $$parent.$$childScopes.push(this);
	    }
	    /*
	     Make self childs
	     */
	    if ("undefined"===typeof this.$$childScopes) this.$$childScopes = [];
	}.proto({
	    /*
	     Creates new scope
	     */
	    $newScope: function() {
	        this.$$childScopes.push(new Scope(this));
	        return this.$$childScopes[this.$$childScopes.length-1];
	    },
	    /*
	     Append existing scope as child
	     */
	    $appendScope: function($scope) {
	        this.$$childScopes.push($scope);
	        $scope.$$parentScope = this;
	        return this;
	    },
	    /*
	     Returns user customizing data from this.$polyscope.customization
	     */
	    $$getCustomizationByMatch: function(customizer, expr) {
	        if (this.$polyscope.customization[customizer].length>0) {
	            for (i=0;i<this.$polyscope.customization[customizer].length;++i) {
	                if (this.$polyscope.customization[customizer][i].match && "undefined"!==typeof expr && null!==expr
	                    && (this.$polyscope.customization[customizer][i].match===true || (this.$polyscope.customization[customizer][i].match instanceof RegExp && this.$polyscope.customization[customizer][i].match.test(expr)) || ("function"===typeof this.$polyscope.customization[customizer][i].match && this.$polyscope.customization[customizer][i].match(expr)))) {
	                    return this.$polyscope.customization[customizer][i];
	                }
	            }
	        }
	        return false;
	    },
	    /*
	     Watch an expression (function) or set of expressions (means array)

	     Arguments:
	     * expr - string or function
	     * For example $watch('person.name', function() { })
	     * Or $watch(function() { return person.name; }, function() { });

	     * callback - function

	     * bitoptions - special set of bit options. Use constants POLYSCOPE_WATCH, POLYSCOPE_DEEP, POLYSCOPE_INFO to specify options.
	     * For example: $watch('person.name', function() { }, POLYSCOPE_WATCH | POLYSCOPE_DEEP)
	     * If u use at last one of bitoption constants, be carefull, other options

	     */
	    $watch: function(expr, callback, bitoption, reserve) {
	        if (bitoption===true) {
	            bitoption = POLYSCOPE_DEEP;
	        }
	        /*
	         Support capabilities specify the name of a shared object
	         */
	        return this.$fetch.apply(this, ("string"===typeof expr && callback instanceof Array && ("number"!==typeof bitoption && "undefined"!==typeof bitoption)) ? [expr, callback, bitoption, bitPush(reserve||0, POLYSCOPE_WATCH)] : [expr, callback, bitoption||bitPush(0, POLYSCOPE_WATCH)])
	    },
	    /*
	     Get some value from current object by expression.
	     Use special symbols at start of string to setup deep, watch and ditails options for each of expression.
	     '+' - watch an expression
	     '++' - deep watch an expression
	     '?' - return full info for each expression result (value, diff, oldvalue)

	     For example:
	     ```
	     $fetch('?++person', function(person) { }); // Watch person object with deep comparsion and full info
	     $fetch('++person', function(person) { }); // Watch person object with deep comparsion
	     $fetch('+person', function(person) { }); // Watch person object
	     $fetch('person', function(person) { }); // Just get value of expression once
	     ```

	     Multiple expressions:
	     ```
	     $fetch(['+person', 'status.weight', '?++money'], function(person, weight, money) {

	     });
	     ```

	     Using custom functions instead expression:
	     $fetch(['+person', function() { return this.status.weight; }, '?++money'], function(...) { });

	     If you wont to specify options to the function in single fetch, put to the 3th argument bitoptions.
	     Just like that:

	     ```
	     $fetch(function() { return person }, callback, POLYSCOPE_WATCH | POLYSCOPE_DITAILS | POLYSCOPR_DEEP);
	     ```

	     Anyway, if you wanna to use custom functions array and also bitoptions
	     you should replace each function to an array with simple structure:

	     ```
	     $fetch([
	     [function() { ... }, POLYSCOPE_WATCH | POLYSCOPE_DITAILS | POLYSCOPR_DEEP]
	     ], callback);
	     ```
	     */
	    $fetch: function(expressions, callback, bitoptions, reserve) {
	        var singleRequest=false,shared=false;
	        if (bitoptions===true) bitoptions = POLYSCOPE_DEEP;
	        if ("function"===typeof bitoptions && "function"!==typeof callback && "string"===typeof expressions) {
	            shared=expressions;
	            expressions=callback;
	            callback=bitoptions;
	            bitoptions=reserve;
	            if (shared) expressions = expressions.map(function(exp) { var flags = flagsFndRegExpr.exec(exp); return (flags?flags[1]:'')+shared+'.'+exp.replace(flagsFndRegExpr, '')});
	        }
	        else if (!(expressions instanceof Array) || "number"===typeof expressions[1]) {
	            singleRequest = true;
	            expressions = "string" === typeof expressions ? [expressions] : (expressions instanceof Array ? [[expressions[0], bitPush(expressions[1], bitoptions || POLYSCOPE_ONCE)]] : [[expressions, bitoptions || (POLYSCOPE_ONCE)]]);
	        } else if (expressions instanceof Array && "number"===typeof expressions[1]) {
	            expressions = [expressions];
	        }

	        /*
	         Injection to callback
	         */
	        if (this.$polyscope.injects.length>0) callback = inject(callback, this.$polyscope.injects);

	        var self=this,
	            watchable = expressions.map(function(val) {
	                if ("string"===typeof val) {
	                    var map = 0,q;
	                    if (q = (/^[?+]?([+]{1,2})/).exec(val)) {
	                        map = map | POLYSCOPE_WATCH;
	                        if (q[1].length>1) map = map | POLYSCOPE_DEEP;
	                        if (q[1].length>2) map = map | POLYSCOPE_COMPARE;
	                    } else {
	                        map = map | (bitoptions || POLYSCOPE_ONCE);
	                    }
	                    if (/^[?+]?([?]{1})/.test(val))
	                        map = map | POLYSCOPE_DITAILS;
	                    if (map===0) map = POLYSCOPE_DEFAULT;

	                    return [
	                        val.replace(/^[+?]*/, ''),
	                        map
	                    ];
	                } else {
	                    return val;
	                }
	            });

	        return this.$watchGroup(watchable, function() {
	            var results = singleRequest ? Array.prototype.slice.apply(arguments) : Array.prototype.slice.apply(arguments).map(function(val, index) {
	                return watchable[index] instanceof Array && watchable[index][1] && watchable[index][1] & POLYSCOPE_DITAILS ? val : val[0];
	            });
	            callback.apply(self, singleRequest ?
	                results[0]:
	                results);
	        }, POLYSCOPE_ARRAYRESULT);
	    },
	    /*
	     Watch set
	     $watchGroup([expr1, expr2, expr3], function(val1, val2, val3) { })

	     Option `fullinfo` make passible to get full info about result value. The result will be an array, where first key is new value, second value id diff.
	     val1 = [value, diff];

	     There is a way to specify watching mode while watching expression. To perform it value must be performed as array where first value is expression, and second is a number
	     To specify options use next bitmap

	     1 - watch
	     2 - standart watching with plain comparing
	     4 - deep compare

	     for example, to set options !watch and deep and fullstack

	     [function() { }, (2 | 4)]

	     $watchGroup(['start', 0], ['height', 1] , ['mystack', 2])

	     */
	    $watchGroup: function(expressions, callback, advoption) {
	        advoption = advoption || 0;
	        var self = this,
	            snapshot = '';
	        if (!(expressions instanceof Array)) {
	            expressions = [expressions];
	        }
	        var unwatchers = Array(),
	            unwacther = function() {
	                for (var i = 0;i<unwatchers.length;++i) {
	                    unwatchers[i].destroy();
	                }
	            };
	        new Promises(function(Promise) {
	            for (var prop in expressions) {
	                if (expressions.hasOwnProperty(prop)) {
	                    Promise(function(resolve, reject) {
	                        var deep = false,
	                            watch=false,
	                            fullinfo=false,
	                            unwatcher;
	                        var bitoptions;
	                        if (expressions[prop] instanceof Array) {
	                            bitoptions = expressions[prop][1];

	                        } else {
	                            bitoptions = POLYSCOPE_WATCH;
	                            fullinfo = false;
	                        }

	                        unwatcher = self.$watchExpr(expressions[prop] instanceof Array ? expressions[prop][0] : expressions[prop], function(val) {

	                            resolve.apply(self, (advoption & POLYSCOPE_ARRAYRESULT ? [Array.prototype.slice.apply(arguments)] : Array.prototype.slice.apply(arguments)));
	                        }, bitoptions);
	                        unwatchers.push(unwatcher);
	                    });
	                }
	            }
	        })
	            .then(function() {
	                var snap = dataSnap(Array.prototype.slice.apply(arguments));
	                if (snap===snapshot) return; // Data not changed
	                callback.apply(self, arguments);
	            }, true)
	            .catch(function() {
	                var snap = dataSnap(Array.prototype.slice.apply(arguments));
	                if (snap===snapshot) return; // Data not changed
	                callback.apply(self, arguments);
	            }, true);

	        return unwacther;
	    },
	    /*
	     Watch expression and return value to fn.
	     Option `config` means that there will be an in-depth comparison.

	     Furthermore, the option may include bit map, you can use next constants to set
	     next options:
	     POLYSCOPE_DEEP - deep comparison
	     POLYSCOPE_ONCE - destroy watcher after first react
	     POLYSCOPE_DITAILS - force full info

	     Notice: if you dont wanna to watch expression and keep it alive use POLYSCOPE_ONCE

	     CUSTOMIZE ==
	     You can customize watch engine via configuration
	     ```
	     __$$polyscope.customized.watchExprRouters.push({
	     match: /^scope\./,
	     replace: /^(scope)/,
	     scope: someobject,
	     overrideMethod: function(expr, callback, bitconfig) { ... }
	     })
	     ```
	     New method should take arguments:
	     - expr: expression or function
	     - callback: callback function
	     - bitconfig: bit options WHERE
	     - !!(bitconfig & POLYSCOPE_DEEP): deep flag (parse objects deep)
	     - !(bitconfig & POLYSCOPE_ONCE) || !!(bitconfig & POLYSCOPE_WATCH): keep watching (is false - once)
	     - !!(bitconfig & POLYSCOPE_DITAILS): return 3 aguments (newvalue, difference, oldvalue)
	     - !!(bitconfig & POLYSCOPE_COMPARE) || !!(bitconfig & POLYSCOPE_DITAILS): superdeep comparison mode

	     Watch method must send back at least one argument `newvalue`, in mode !!(bitconfig & POLYSCOPE_DITAILS) it should send 3 arguments (newvalue, difference, oldvalue)
	     Function itself must return an object with method destroy that destroy a watcher^

	     */
	    $watchExpr: function(expr, callback, bitconfig) {
	        var deep,
	            watch,
	            fullinfo,
	            self=this,
	            i=0,
	            scope=this,
	            overrideMethod=!1;
	        if ("number"===typeof bitconfig) {
	            deep = !!(bitconfig & POLYSCOPE_DEEP);
	            watch = !(bitconfig & POLYSCOPE_ONCE);
	            fullinfo = !!(bitconfig & POLYSCOPE_DITAILS);
	            compare = !!(bitconfig & POLYSCOPE_COMPARE) || !!(bitconfig & POLYSCOPE_DITAILS);
	        } else {
	            deep = !!bitconfig;
	            watch = true;
	            fullinfo = false;
	            compare = false;
	        }

	        /*
	         Configurated overrides and custom conditional options predetermined in this.$$polyscope.customized.watchExprRouters[]
	         this.$$polyscope.customized.watchExprRouters[] must have property `match` with regexpr determines its participation.
	         Property `replace` contains regular expression to replace some text in expression. Property `scope` set up default scopr for this expression
	         */
	        var customizer = "string"===typeof expr ? this.$$getCustomizationByMatch('watchExprRouters', expr) : false;
	        if (customizer){
	            if (customizer.scope)
	                scope = customizer.match[i].scope;
	            if (customizer.replace instanceof RegExp)
	                expr = expr.replace(customizer.replace, '');
	            if (customizer.overrideMethod)
	                overrideMethod = customizer.overrideMethod;
	        }
	        /*
	         Main part of execution. Check and run override method or use native.
	         */
	        if ("function"===typeof overrideMethod) {
	            var watcher, importArgs, evolved=false;
	            watcher = overrideMethod.call(scope, expr, function() {
	                importArgs = Array.prototype.slice.apply(arguments);
	                if (evolved===false) evolved = true;
	                else evolved();
	            }, bitconfig);
	            if (evolved===true) {
	                 if (!watch) watcher.destroy();
	                 callback.apply(self, importArgs);
	            } else {
	                evolved=function() {
	                    if (!watch) watcher.destroy();
	                    callback.apply(self, importArgs);
	                }
	            }
	        } else {
	            var result = this.$parse(expr, scope);

	            if ("object"===typeof result)
	                var l = compare ? extend(true, {}, result) : result;
	            else l = result;
	            var watcher = {
	                expr: expr,
	                listner: callback || false,
	                last: deep?clone(l):l,
	                diff: l, // Last value of diff
	                deep: !!deep, // Compare objects without diff
	                compare: !!compare, // Deep analysis for objects diff
	                once: !watch,
	                fullinfo: fullinfo,
	                scope: scope
	            };

	            this.$$watchers.push(watcher);
	            var index = this.$$watchers.length-1, watchers=this.$$watchers;

	            watcher.destroy = function() {
	                watchers[index]=null;
	            }

	            // Callback now
	            callback(l,l,l);
	            if (watcher.once) watcher.destroy();
	        }

	        return watcher;
	    },
	    $parse: function(expr, scope) {
	        var result, customizer;
	        if (("undefined"===typeof scope) && ("string"===typeof expr) && (customizer = this.$$getCustomizationByMatch('watchExprRouters', expr))) {
	            if (customizer.scope) scope = customizer.scope;
	            if (customizer.replace instanceof RegExp) expr.replace(customizer.replace, '');
	        }

	        if ("function"===typeof expr) {
	            result = expr.apply(scope||this);
	        } else if ("string"===typeof expr) {
	            with(scope||this) {
	                try {
	                    eval('result = '+expr+';');
	                } catch(e) {
	                    throw 'Error in expression: '+'result = '+expr+';';
	                    result = new Error(e);
	                }
	            }
	        } else {
	            result = expr;
	        }
	        return result;
	    },
	    /*
	     Вносит изменения в cache и запускает digest во всем дереве
	     */
	    $apply: function(exprFn, data, context) {
	        /*
	         Injection to exprFn
	         */
	        if ("function"===typeof exprFn && this.$polyscope.injects.length>0) exprFn = inject(exprFn, this.$polyscope.injects);

	        var result = this.$parse(exprFn, context||undefined),
	            parent = this;
	        while(null!==this.$$parentScope && "object"===typeof this.$$parentScope && "function"===typeof this.$$parentScope.$digest) {
	            parent = this.$$parentScope;
	        }
	        parent.$digest();
	        return result;
	    },
	    /* Выполняет выражение и запускает цикл */
	    $eval: function(exprFn, data, context) {
	        /*
	         Injection to exprFn
	         */
	        if ("function"===typeof exprFn && this.$polyscope.injects.length>0) exprFn = inject(exprFn, this.$polyscope.injects);

	        var result = this.$parse(exprFn, context||undefined);
	        this.$digest();
	        return result;
	    },
	    /*
	     Получает суммарные данные объекта. Это значит что перед тем как
	     вернуть объект он мержит все его ветки в одну. На выходе получается
	     объект с самыми свежими правками.
	     Можно специфицировать ветку для выдачи в параметре branch, тогда будет
	     возвращен объект только с учетом изменений в указанной ветке.
	     */
	    $digest: function() {
	        var self = this;

	        // Immersion to childs
	        if (this.$$childScopes instanceof Array) {
	            for (var i = 0;i<this.$$childScopes.length;++i) {

	                if ("function"===typeof this.$$childScopes[i].$digest) {
	                    /*
	                     Customization of childrens digest call
	                     */
	                    var cd = this.$$getCustomizationByMatch('digestEmploymentsRoutes', this.$$childScopes[i]);
	                    if (cd) cd.overrideMethod.call(this, this.$$childScopes[i]);
	                    else
	                        this.$$childScopes[i].$digest();
	                }
	            }
	        }

	        if (this.$$digestInProgress) { this.$$digestRequired = true; return }
	        this.$$digestInProgress = true;

	        this.$$watchers.forEach(function(watch) {
	            if (watch===null) return;
	            var newly = self.$parse(watch.expr, watch.scope),different=false;
	            if ("object"===typeof newly && "object"===typeof watch.last) {

	                if (watch.deep) {
	                    if (watch.compare) {
	                        var diff = compareObjects(newly, watch.last);
	                        if (diff.$$hashKey) delete diff.$$hashKey; // Delete angular stuff
	                        different=(JSON.stringify(diff) !== '{}');
	                    } else {
	                        different=(JSON.stringify(newly)!==JSON.stringify(watch.last));

	                        if (different) diff = newly;
	                        else diff = {};
	                    }
	                } else {
	                    different= (newly!==watch.last);
	                    diff = newly;
	                }

	            } else if (typeof newly !== typeof watch.last) {

	                different = true;
	                diff = newly;
	            } else {

	                if (newly!==watch.last) {

	                    different = true;
	                    diff = newly;
	                } else {

	                    different = false;
	                    diff = '';
	                }
	            };

	            watch.diff = diff;
	            if (different) {
	                watch.listner(newly, diff, watch.last);
	                if (watch.once) watch.destroy();
	                watch.last = "object"===typeof newly ? (watch.deep ? clone(newly) : newly) : newly;
	            }

	        });
	        if (this.$$digestRequired) {
	            this.$$digestInterationCount++;
	            if (this.$digestInterationCount>5) {
	                throw 'Digest max interation count';
	            }
	            this.$digest();
	        } else {
	            this.$$digestInterationCount=0;
	            this.$$digestInProgress = false;
	        }
	    },
	    $approve: function() {
	        sx.utils.eachArray(this.$$watchers, function(watch) {
	            if (watch===null) return;
	            var newly = this.$parse(watch.expr);
	            var diff = sx.utils.compareObjects(newly, watch.last);
	            if (diff.$$hashKey) delete diff.$$hashKey; // Удаляем hashKey angular
	            if (JSON.stringify(diff) !== '{}') {
	                watch.last = extend(true, {}, newly);
	            }
	        });
	    }
	});

	module.exports = Scope;


/***/ },
/* 27 */
/***/ function(module, exports) {

	
	module.exports = function(newly, oldy) {
		/*
		Вначае делаем проверностную проверку
		*/
		if ("object"!==typeof newly || "object"!==typeof oldy) throw 'You can not compare not objects as objects';
		if ((JSON.stringify(newly)===JSON.stringify(oldy)) ) return {};

		var diff = {};
		for (var prop in newly) {
			if (newly.hasOwnProperty(prop)) {
				if ("object" === typeof newly[prop]) {
					if ("object" !== typeof oldy[prop]) {
						diff[prop] = newly[prop];
					}
					else {
						if (JSON.stringify(newly[prop])!==JSON.stringify(oldy[prop]))
						diff[prop] = newly[prop];
					}
				} else {
					if (newly[prop] !== oldy[prop]) {
						diff[prop] = newly[prop];
					}
				}
			}
		}
		return diff;
	}


/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	
	    var classEvents = __webpack_require__(3);
	    var synthetModule = __webpack_require__(29);


	    module.exports = function(synthet) {
	        this.$ = synthet;
	        this.configuration = {
	            template: false
	        }
	        this.watchers = [];
	        this.$.on('angularResolved', function() {
	            /*
	             Включаем наблюдение за DOM внутри контроллера
	             */
	            var $ = this;
	            try {
	                this.watchers.push(angular.element(synthet.$element).scope().$watch(function(){
	                    $.trigger("DOMChanged");
	                }));
	            }
	            catch(e) {

	            }
	        });

	    }.inherit(classEvents)
	        .proto({
	            $inject: function(callback) {
	                return this.$.$inject(callback);
	            },
	            template: function(template, module) {
	                this.configuration.template = template;
	                this.configuration.module = "function"===typeof module?module:false;
	                return this.render();
	            },
	            render: function(template, module, args) {
	                var $ = this;
	                return new Promise(function(resolve, reject) {
	                    /*
	                    Модификация от sag, позволяюшая устанавливать темплейт посредством выполнения функции, включающей в себя
	                    манипуляции с самим элементом
	                    */
	                    if ("function" === typeof template) {
	                        $.$inject(template)();
	                        template = $.$.$element.innerHTML;
	                    }

	                    if (template) $.configuration.template = template;
	                    $.configuration.module = "function"===typeof module?module:false;
	                    if ($.$.__config__.$$angularInitialedStage>1) {
	                        
	                        $.$inject(function($self, template, module) {
	                            //if ($self.__config__.$$angularScope.$id==22) debugger;
	                            $self.__config__.$$angularScope.$applyAsync(function() {
	                                var test = Synthetic.$$angularCompile(template, undefined, undefined)($self.__config__.$$angularScope);
	                                /*
	                                Надо обратить внимание на тот факт, что в случае если к странице подключен jquery angular
	                                использует его методы - это звучит немного безумно, т.к. они отличаются от "родных".
	                                Так например html у angular действует аналогично set innerHTML и не может принимать
	                                данные ввиде массива node. Поэтому для присвоения нового html необходимо использовать
	                                append предварительно очищая элемент с помощью html('').
	                                */

	                                /*
	                                Модификация от sag, позволяюшая использовать рендеринг при использовании jQuery, вместо JQLite.
	                                */
	                                if (Synthetic.$angularjQueryPowered) $self.__config__.$$angularElement.html(test); else $self.__config__.$$angularElement.empty().append(test);
	                               

	                                /*
	                                После установки шаблона необходимо произвести пересмотр scope
	                                */
	                                

	                                $.$.trigger("rendered");
	                                resolve($self.__config__.$$angularElement[0]);
	                                //$.$.bubbling('shake'); // Shake all roots

	                                if (module) {

	                                    $.setup(module, args);
	                                }
	                            });
	                            
	                        })($.configuration.template, $.configuration.module);
	                    } else {
	                        throw 'NOT READY';
	                        $.$.$element.innerHTML = $.$.$element.innerHTML = minTemplate($.configuration.template, $.$.$scope);
	                        
	                        resolve($.$.$element);

	                        if ($.configuration.module) {
	                            $.setup($.configuration.module);
	                        }
	                        $.$.trigger("rendered");
	                    }
	                });
	            },
	            setup: function(module, args) {

	                var $synthet = this.$;

	                /*
	                Для начала запускаем дестроер для старого модуля, если он есть
	                */
	                if (null !== this.$.module && "object"===typeof this.$.module&&"function"===typeof this.$.module.$destroy) {
	                    this.$.module.$destroy();
	                }

	                var init = function() {
	                    this.$ = $synthet;
	                    this.$controller = $synthet;
	                };

	                var nm = function() {

	                }
	                .inherit(synthetModule)
	                    .inherit(module)
	                    .inherit(init);

	                /*
	                Расширение модуля прототипом указанном в опциях
	                */
	                if ("function"===typeof this.$.__config__.templateModulePrototype) {
	                    nm = nm.inherit(this.$.__config__.templateModulePrototype);
	                } else if ("object"===typeof this.$.__config__.templateModulePrototype) {
	                    var overMod = function() { }.proto(this.$.__config__.templateModulePrototype);
	                    nm = nm.inherit(overMod);
	                }  

	                /*
	                Выносим процедуру инициализации модуля в отдельную функцию для обеспечения возможности
	                вызова пользовательской функции initialUserModuleCondition перед ней.

	                Согласно версии sx - данная функция сохраняется как метод объекта, что позволит вызывать ее
	                из вне. Однако необходимость этого еще нужно проверить.
	                */ 
	                this.moduleReinit = function() {
	                     if (args) {
	                        $synthet.module = nm.construct(args);
	                    } else {
	                        $synthet.module = new nm();
	                    }
	                };

	                if ("function"===typeof this.$.__config__.initialUserModuleCondition) {
	                    this.$.__config__.initialUserModuleCondition.call($synthet, this.moduleReinit);
	                } else {
	                    this.moduleReinit();
	                }
	               

	                //this.$.$injectors.$scope.$module = this.$.module;
	            },
	            destroy: function() {
	                /*
	                Очищаем модуль
	                */
	                if ("object"===typeof this.$.module&&"function"===typeof this.$.module.destory) {
	                    this.$.module.destory();
	                }

	                this.$.module = null;
	                /*
	                Очищаем наблюдвтелей
	                */
	                for (var i = 0;i<this.watchers.length;++i) {
	                    this.watchers[i]();
	                }
	                /*
	                Очищаем события
	                */
	                this.clearEventListners();
	            }
	        });

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(16);
	module.exports = function() {
	    //console.debug('DEBUG ME: because im starting after module initialization. This is very baaad.');
	}.proto({
	    $apply: function(cb) {
	        return this.$.$apply(cb);
	    },
	    /*
	     Данная функция выполняет некую процедуру, остаточные объектвы которые будут удалены
	     возвращаемой функцийей
	     */
	    $hitch: function(cb, keys) {
	        
	        var fkey = cb.toString()+("object"===typeof keys ? JSON.stringify(keys) : (keys ? keys.toString() : '') );
	        
	        if ("function"===typeof this.$hitchers[fkey]) this.$hitchers[fkey].call(this);
	        this.$hitchers[fkey] = this.$.$run(cb);

	        return function(i) {
	            this.$hitchers[i].call(this); delete this.$hitchers[i];
	        }.bind(this, fkey)
	    },
	    $destroy: function() {
	        /*
	        Очищаем hitchers
	        */
	        for (var i in this.$hitchers) {
	           
	            if (this.$hitchers.hasOwnProperty(i)&&"function"===typeof this.$hitchers[i]) {
	                this.$hitchers[i].call(this);
	            }
	        }
	    }
	});

/***/ },
/* 30 */
/***/ function(module, exports) {

	/*! (C) WebReflection Mit Style License */
	(function(e,t,n,r){"use strict";function rt(e,t){for(var n=0,r=e.length;n<r;n++)vt(e[n],t)}function it(e){for(var t=0,n=e.length,r;t<n;t++)r=e[t],nt(r,b[ot(r)])}function st(e){return function(t){j(t)&&(vt(t,e),rt(t.querySelectorAll(w),e))}}function ot(e){var t=e.getAttribute("is"),n=e.nodeName.toUpperCase(),r=S.call(y,t?v+t.toUpperCase():d+n);return t&&-1<r&&!ut(n,t)?-1:r}function ut(e,t){return-1<w.indexOf(e+'[is="'+t+'"]')}function at(e){var t=e.currentTarget,n=e.attrChange,r=e.attrName,i=e.target;Q&&(!i||i===t)&&t.attributeChangedCallback&&r!=="style"&e.prevValue!==e.newValue&&t.attributeChangedCallback(r,n===e[a]?null:e.prevValue,n===e[l]?null:e.newValue)}function ft(e){var t=st(e);return function(e){X.push(t,e.target)}}function lt(e){K&&(K=!1,e.currentTarget.removeEventListener(h,lt)),rt((e.target||t).querySelectorAll(w),e.detail===o?o:s),B&&pt()}function ct(e,t){var n=this;q.call(n,e,t),G.call(n,{target:n})}function ht(e,t){D(e,t),et?et.observe(e,z):(J&&(e.setAttribute=ct,e[i]=Z(e),e.addEventListener(p,G)),e.addEventListener(c,at)),e.createdCallback&&Q&&(e.created=!0,e.createdCallback(),e.created=!1)}function pt(){for(var e,t=0,n=F.length;t<n;t++)e=F[t],E.contains(e)||(n--,F.splice(t--,1),vt(e,o))}function dt(e){throw new Error("A "+e+" type is already registered")}function vt(e,t){var n,r=ot(e);-1<r&&(tt(e,b[r]),r=0,t===s&&!e[s]?(e[o]=!1,e[s]=!0,r=1,B&&S.call(F,e)<0&&F.push(e)):t===o&&!e[o]&&(e[s]=!1,e[o]=!0,r=1),r&&(n=e[t+"Callback"])&&n.call(e))}if(r in t)return;var i="__"+r+(Math.random()*1e5>>0),s="attached",o="detached",u="extends",a="ADDITION",f="MODIFICATION",l="REMOVAL",c="DOMAttrModified",h="DOMContentLoaded",p="DOMSubtreeModified",d="<",v="=",m=/^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+$/,g=["ANNOTATION-XML","COLOR-PROFILE","FONT-FACE","FONT-FACE-SRC","FONT-FACE-URI","FONT-FACE-FORMAT","FONT-FACE-NAME","MISSING-GLYPH"],y=[],b=[],w="",E=t.documentElement,S=y.indexOf||function(e){for(var t=this.length;t--&&this[t]!==e;);return t},x=n.prototype,T=x.hasOwnProperty,N=x.isPrototypeOf,C=n.defineProperty,k=n.getOwnPropertyDescriptor,L=n.getOwnPropertyNames,A=n.getPrototypeOf,O=n.setPrototypeOf,M=!!n.__proto__,_=n.create||function mt(e){return e?(mt.prototype=e,new mt):this},D=O||(M?function(e,t){return e.__proto__=t,e}:L&&k?function(){function e(e,t){for(var n,r=L(t),i=0,s=r.length;i<s;i++)n=r[i],T.call(e,n)||C(e,n,k(t,n))}return function(t,n){do e(t,n);while((n=A(n))&&!N.call(n,t));return t}}():function(e,t){for(var n in t)e[n]=t[n];return e}),P=e.MutationObserver||e.WebKitMutationObserver,H=(e.HTMLElement||e.Element||e.Node).prototype,B=!N.call(H,E),j=B?function(e){return e.nodeType===1}:function(e){return N.call(H,e)},F=B&&[],I=H.cloneNode,q=H.setAttribute,R=H.removeAttribute,U=t.createElement,z=P&&{attributes:!0,characterData:!0,attributeOldValue:!0},W=P||function(e){J=!1,E.removeEventListener(c,W)},X,V=e.requestAnimationFrame||e.webkitRequestAnimationFrame||e.mozRequestAnimationFrame||e.msRequestAnimationFrame||function(e){setTimeout(e,10)},$=!1,J=!0,K=!0,Q=!0,G,Y,Z,et,tt,nt;O||M?(tt=function(e,t){N.call(t,e)||ht(e,t)},nt=ht):(tt=function(e,t){e[i]||(e[i]=n(!0),ht(e,t))},nt=tt),B?(J=!1,function(){var e=k(H,"addEventListener"),t=e.value,n=function(e){var t=new CustomEvent(c,{bubbles:!0});t.attrName=e,t.prevValue=this.getAttribute(e),t.newValue=null,t[l]=t.attrChange=2,R.call(this,e),this.dispatchEvent(t)},r=function(e,t){var n=this.hasAttribute(e),r=n&&this.getAttribute(e),i=new CustomEvent(c,{bubbles:!0});q.call(this,e,t),i.attrName=e,i.prevValue=n?r:null,i.newValue=t,n?i[f]=i.attrChange=1:i[a]=i.attrChange=0,this.dispatchEvent(i)},s=function(e){var t=e.currentTarget,n=t[i],r=e.propertyName,s;n.hasOwnProperty(r)&&(n=n[r],s=new CustomEvent(c,{bubbles:!0}),s.attrName=n.name,s.prevValue=n.value||null,s.newValue=n.value=t[r]||null,s.prevValue==null?s[a]=s.attrChange=0:s[f]=s.attrChange=1,t.dispatchEvent(s))};e.value=function(e,o,u){e===c&&this.attributeChangedCallback&&this.setAttribute!==r&&(this[i]={className:{name:"class",value:this.className}},this.setAttribute=r,this.removeAttribute=n,t.call(this,"propertychange",s)),t.call(this,e,o,u)},C(H,"addEventListener",e)}()):P||(E.addEventListener(c,W),E.setAttribute(i,1),E.removeAttribute(i),J&&(G=function(e){var t=this,n,r,s;if(t===e.target){n=t[i],t[i]=r=Z(t);for(s in r){if(!(s in n))return Y(0,t,s,n[s],r[s],a);if(r[s]!==n[s])return Y(1,t,s,n[s],r[s],f)}for(s in n)if(!(s in r))return Y(2,t,s,n[s],r[s],l)}},Y=function(e,t,n,r,i,s){var o={attrChange:e,currentTarget:t,attrName:n,prevValue:r,newValue:i};o[s]=e,at(o)},Z=function(e){for(var t,n,r={},i=e.attributes,s=0,o=i.length;s<o;s++)t=i[s],n=t.name,n!=="setAttribute"&&(r[n]=t.value);return r})),t[r]=function(n,r){c=n.toUpperCase(),$||($=!0,P?(et=function(e,t){function n(e,t){for(var n=0,r=e.length;n<r;t(e[n++]));}return new P(function(r){for(var i,s,o,u=0,a=r.length;u<a;u++)i=r[u],i.type==="childList"?(n(i.addedNodes,e),n(i.removedNodes,t)):(s=i.target,Q&&s.attributeChangedCallback&&i.attributeName!=="style"&&(o=s.getAttribute(i.attributeName),o!==i.oldValue&&s.attributeChangedCallback(i.attributeName,i.oldValue,o)))})}(st(s),st(o)),et.observe(t,{childList:!0,subtree:!0})):(X=[],V(function E(){while(X.length)X.shift().call(null,X.shift());V(E)}),t.addEventListener("DOMNodeInserted",ft(s)),t.addEventListener("DOMNodeRemoved",ft(o))),t.addEventListener(h,lt),t.addEventListener("readystatechange",lt),t.createElement=function(e,n){var r=U.apply(t,arguments),i=""+e,s=S.call(y,(n?v:d)+(n||i).toUpperCase()),o=-1<s;return n&&(r.setAttribute("is",n=n.toLowerCase()),o&&(o=ut(i.toUpperCase(),n))),Q=!t.createElement.innerHTMLHelper,o&&nt(r,b[s]),r},H.cloneNode=function(e){var t=I.call(this,!!e),n=ot(t);return-1<n&&nt(t,b[n]),e&&it(t.querySelectorAll(w)),t}),-2<S.call(y,v+c)+S.call(y,d+c)&&dt(n);if(!m.test(c)||-1<S.call(g,c))throw new Error("The type "+n+" is invalid");var i=function(){return f?t.createElement(l,c):t.createElement(l)},a=r||x,f=T.call(a,u),l=f?r[u].toUpperCase():c,c,p;return f&&-1<S.call(y,d+l)&&dt(l),p=y.push((f?v:d)+c)-1,w=w.concat(w.length?",":"",f?l+'[is="'+n.toLowerCase()+'"]':l),i.prototype=b[p]=T.call(a,"prototype")?a.prototype:_(H),rt(t.querySelectorAll(w),s),i}})(window,document,Object,"registerElement");

/***/ }
/******/ ])
});
;