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
	var mixin = __webpack_require__(3);
	var eventsClass = __webpack_require__(4);
	var camelize = __webpack_require__(6);
	var smartCallback = __webpack_require__(5);
	var ComponentPreFactory = __webpack_require__(7);
	var initAngular = __webpack_require__(8);
	var scopeGenerator = __webpack_require__(9);
	var WebElementFactory = __webpack_require__(15);
	__webpack_require__(11);
	__webpack_require__(24);

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
	               self.synthetic.$element.style.visibility = 'visible';
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
	        if (this.synthetic.$injectors.$generator.configuration.module) {
	            this.synthetic.$injectors.$generator.moduleReinit();
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
	    for (var i = 0;i<componentFactory.constructors.length;++i) {
	        WebElementFactory.inherit(componentFactory.constructors[i]);
	    }
	   
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

	Synthetic.createComponent = function(componentOptions, constructor) {

	    var defaultOptions = {
	        name: '',
	        engine: 'sinthezia'
	    };

	    /*
	    Преобразуем строковое представление componentOptions в объект
	    */
	    componentOptions = "string"!==typeof componentOptions ?
	    mixin(defaultOptions, componentOptions) : mixin(defaultOptions, {
	        name: componentOptions
	    });

	    /*
	    Преобразуем строкове представление engine в объект
	    */
	    if ("string"===typeof componentOptions.engine) {
	        componentOptions.engine = {
	            name: componentOptions.engine,
	            initial: false
	        }
	    } else if ("object"===typeof componentOptions.engine&&componentOptions.engine instanceof Array) {
	        componentOptions.engine = {
	            name: componentOptions.engine[0],
	            initial: componentOptions.engine[1]||false
	        }
	    }

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

	    // Normalize scope
	    componentOptions.scope = "object"===typeof componentOptions.scope ? componentOptions.scope : {};

	    /*
	    Если мы используем angular, то помимо копонента мы создаем минимальную директиву,
	    задача которой будет создавать изолированный scope для каждого компонента
	    */
	    if (componentOptions.engine.name==='angular') {
	        /* Creates angular app if not exists. Why i'm speaking english??? */
	        if ("undefined"===typeof Synthetic.$$angularApp) {
	            initAngular();
	        }
	        
	        if ("function"===typeof componentFactory.options.engine.initial) {
	            componentFactory.options.engine.initial(Synthetic.$$angularApp);
	        }

	        var rcolor = getRandomColor();
	        Synthetic.$$angularApp.directive(camelize(componentOptions.name), function() {
	            return {
	                restrict: 'E',
	                priority: 998,
	                scope: true,
	                controller: function($element) {

	                },
	                compile: function($element, $rscope, $a, $controllersBoundTransclude) {

	                    // Запоминаем стартовое значение html
	                    var $defaultHtml = $element[0].innerHTML;

	                    if (Synthetic($element[0]))
	                    Synthetic($element[0]).__config__.$$angularDirectived = true;
	                    else {
	                        /* Если директива отработала быстрей через компонент, то мы производим незамедлительную инициализацию */
	                        componentCreater.call($element[0], componentFactory);
	                    }

	                    
	                    return {
	                        pre: function($scope, $element) {
	                            if (!Synthetic($element[0])) return;
	                            Synthetic($element[0]).__config__.$$angularDirectived = true;
	                            /*
	                            В данной ситуации пришлось отказаться от использования extend для
	                            создания дефолтного значения scope на основе предустановок;
	                            Странно, но даже при использовании extend, который является близкой копией extend
	                            из jQuery, некоторые свойства источника передаются по ссылке, а не копируются, что 
	                            приводит к катастрофическим ошибкам, связанным с записью данных в источник.

	                            Функция startextend гарантирует, что все копируемые свойства будут перевоссозданы заново,
	                            однако эта функция не осуствляет миксим с существующими значениями $scope, поэтому ее можно
	                            использовать только при первичной инициализации.

	                            Желательно выяснить по какой причине extend не создает требуемых копий свойств.
	                            */
	                            startextend($scope, componentOptions.scope);

	                            
	                            /*
	                            Если scope для элемента не установлен, то вероятно этот элемент используется в ngRepeat и временно
	                            пермещен в documentFragment. Такой элемент не нужно инициализировать.

	                            !!! Однако если мы размещаем диерктивы по приоритету ниже чем ng-repeat, то pre не вызывается в принципе.
	                            TODO: решить это
	                            */
	                            /*if (angular.element($element[0]).scope()===undefined) {
	                                console.log("%c<custom-directive>", "color:blue;font-weight:bold;", 'destroy', $element, $scope);
	                                Synthetic($element[0]).$destroy();
	                                return;
	                            }*/


	                            Synthetic($element[0]).__config__.$$angularDirectived = true;
	                            scopeGenerator($element[0].synthetic, $scope);

	                            return function(scope) {
	                                //console.log('prePost', scope);
	                            }
	                           
	                        },
	                        post: function($scope, $element) {
	                            if (!Synthetic($element[0])) return;
	                            // 3 этап инициализации angular означает, что объект полностью
	                            // инициализирован
	                            Synthetic($element[0]).__config__.$$angularInitialedStage = 3;
	                        }
	                    }
	                    
	                    /**/
	                }
	            }
	        });
	    };

	    var prototype = window[componentOptions.HTMLElementPrototype || "HTMLElement"].prototype;
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
	                                        
	                                        $self.$injectors.$scope.attributes[camelized] = value;
	                                        
	                                        if (name.substr(0,5)==='data-') {
	                                                $self.$injectors.$scope.properties[camelize(name.substr(5))] = value;
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
	                                this.synthetic.$injectors.$scope.attributes[camelize(name)] = value;
	                                if (name.substr(0,5)==='data-') {
	                                   
	                                        this.synthetic.$injectors.$scope.properties[camelize(name.substr(5))] = value;
	                                   
	                                }
	                            }
	                        }
	                    }
	                }
	            }
	        })
	    };

	    if (componentOptions.extends) elementOptions.extends = componentOptions.extends;
	    document.registerElement(componentOptions.name, elementOptions);
	    return componentFactory;
	}

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
			Mixin.prototype = Object.create(superprototype,{
				
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
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	
	    var smartCallback = __webpack_require__(5);

		var Events = function() {
			this.eventListners = {};
	        this.bubblingListners = {};
	        this.surfacingListners = {};
			this.eventTracks = {};
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

	            if (!once) {

	                this.eventListners[e].push({
	                    callback: this.$inject(callback),
	                    once: once||false
	                });

	                var $handler = new eventListner(this, e, this.eventListners[e].length-1);
	            }

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
/* 5 */
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
/* 6 */
/***/ function(module, exports) {

	module.exports = function(txt) {
		return txt.replace(/-([\da-z])/gi, function( all, letter ) {
			return letter.toUpperCase();
		});
	};

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	
		var mixin = __webpack_require__(3);

		var preFactory = function(options) {
			this.options = options;

			this.onCreatedCallbacks = [];
			this.onAttachedCallbacks = [];
			this.onDetachedCallbacks = [];
			this.onAttributeChangedCallbacks = [];
			this.generator = false;
			this.prototypes = [];
			this.constructors = [];
			this.watchers = [];
			this.conceivedCallers = [];
		}
		preFactory.prototype = {
			constructor: preFactory,
			$addConceivedMethod: function(fn, args) {
				this.conceivedCallers.push([fn, args]);
			},
			created: function(callback) {
				
				this.onCreatedCallbacks.push(callback);
				return this;
			},
			attached: function(callback) {
				this.onAttachedCallbacks.push(callback);
				return this;
			},
			detached: function(callback) {
				this.onDetachedCallbacks.push(callback);
				return this;
			},
			attributeChanged: function(callback) {
				this.onAttributeChangedCallbacks.push(callback);
				return this;
			},
			watch: function() {
				this.watchers.push(Array.prototype.slice.apply(arguments));
				return this;
			},
			proto: function(proto) {
				this.prototypes.push(proto);
				return this;
			},
			construct: function(c) {
				this.constructors.push(c);
				return this;
			},
			template: function() {
				this.$addConceivedMethod('$template', arguments);
				return this;
			},
			config: function(useroptions) {
				this.options = mixin(this.options, useroptions);
				return this;
			}
		}

		module.exports = preFactory;

/***/ },
/* 8 */
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
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	
	    var mixin = __webpack_require__(3);
	    var camelize = __webpack_require__(6);
	    var scopeUtilits = __webpack_require__(10);

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

	        $self.$injectors.$scope = $$scope;

	        $self.__config__.allWaitingForResolve = false;

	        $self.__config__.$$angularElement = angular.element($self.$element);

	        $self.__config__.$$angularScope = $$scope;


	        ///////////////   

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
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(11);
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
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var mixin = __webpack_require__(12);
	var inherit = __webpack_require__(13);

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
/* 12 */
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
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {var mixin = __webpack_require__(14);

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
			Mixin.prototype = Object.create(superprototype,{
				
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
/* 14 */
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
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	
	    var WebElementPrototype = __webpack_require__(16);
	    var mixin = __webpack_require__(3);
	    var extend = __webpack_require__(21);
	    var Generator = __webpack_require__(22);
	    var camelize = __webpack_require__(6);
	    var getNonScopeValue = __webpack_require__(18);
	    __webpack_require__(11);

	    /*
	     Как только элемент попадает в DOM он проходит данную инициализацию.
	     Если работа ведется с angular то этот код должен быть выполнен до
	     того как angular применит compile для этой директивы.

	     Когда angular начнет выполнение compile мы должны быть готовы
	     предоставить ей всю необходимую информацию, желательно template и
	     модуль.
	     */
	    module.exports = function(element, component) {

	        /*
	         Устанавливаем отладочную идентификацию
	         */
	        this.$sid = 'sid'+(new Date()).getTime()+Math.round(Math.random()*10000000);

	        /*
	         DEPRODATED: Если в качестве движка выбран angular мы должны добавить аттрибут-директиру, которая уже описана при регистрации компонента
	         TODO: Убедиться, что процедура больше не нужна
	         */
	        if (component.options.engine.name==='angular') {
	            element.setAttribute("sid", this.$sid);
	            this.$$attrsWatchers = {}; // Дополнительный ресурс для watchers, ускоряющий работу за отслеживанием аттрибутов
	        }

	        this.capture('destroy', function() {
	            this.$destroy();
	        });

	        /*
	         Указываем последнюю factory для элемента
	         */
	        Synthetic.$$lastElementFactory = this;

	        /*
	        Устанавливаем ссылку на родительский компонент
	        */
	        this.$parent = false;

	        /*
	        Устанавливаем ссылки на дочерние компоненты
	        */
	        this.$childs = {};

	        /*
	         Устанавливаем пямять для запросов к данным scope
	         */
	        this.$scopeSnaps = {};

	        /*
	         Привязываем элемент к его контроллеру
	         */
	        this.$element = element;

	        /*
	         Привязываем образ компонента
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
	                allWaitingForResolve: false, // Используется при инициализации angular.
	                // DOTO: delete depricated element
	                generator: false, // Depricated
	                $$angularInitialedStage: 0, // Этап инициализации angular
	                $$angularDirectived: false, // Поддерживает ли этот элемент директива angular
	                createdEventFires: false, // Произошло ли событие created
	                attachedEventFires: false, // Произошло ли событие attached
	                templateModulePrototype: false, // Класс, которым автоматичнески расширяется модуль шаблона
	                rendered: false
	            }, component.options)
	        });

	        /*
	        Создаем базовый scope
	        */
	        this.$$scope = {
	            attributes: {}, // Содержит все аттрибуты элемента
	            properties: {}, // Содержит все аттрибуты data-*
	            $shadowTemplate: null,
	            uid: 'syntheticElement'+Math.round(Math.random()*10000)
	        };

	        /*
	        Расширяем scope пользовательскими настройками
	        DEPRICATED - Формирование дефолтного скоуп будет происходить
	        на уровне директивы
	         */
	        /*if ("object"===typeof component.options.scope) {
	            this.$$scope = extend(this.$$scope, component.options.scope);
	        }*/

	        /*
	         Создаем доступное свойство scope, которое назависимо от используемого движка
	         вернет текущий scope
	         */
	         var self = this;
	        Object.defineProperty(this, '$scope', {
	            enumberable: true,
	            get: function() {
	                return self.$injectors.$scope;
	            }
	        });

	        /*
	         Создаем коллекцию инжекторовы
	         */
	        Object.defineProperty(this, '$injectors', {
	            enumerable: false,
	            writable: false,
	            configurable: true,
	            value: {
	                $scope: this.$$scope,
	                $element: element,
	                $self: this,
	                $component: component,
	                $generator: new Generator(this),
	                $stock: {}
	            }
	        });

	        /*
	         Комплекс действий по инициализации angular, произойдет это только в том случае если в опциях
	         компонента указано, что он должен использовать angular
	         */
	        if ("object"===typeof angular&&angular.bootstrap&&component.options.engine.name==='angular') {
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
	                            console.error('damn', e, $self.$element);
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
	        Опция позволяет явно указать что делать с дефолтным html
	        */
	        switch (component.options.defaultHtml) {
	            case "preserve": // Сохранить в documentFragment
	                this.$injectors.$defaultHtml = document.createDocumentFragment();

	                for (var i = 0; i < element.childNodes.length; ++i) {
	                    /*
	                    При клонировании элемента обязательно нужно указывать параметр deep (протестировано на sag)
	                    */
	                    if (element.childNodes[i].nodeType === 1 || element.childNodes[i].nodeType === 3) {
	                        this.$injectors.$defaultHtml.appendChild(element.childNodes[i].cloneNode(true));
	                    }
	                }

	            break;
	            case "clear": // Очистить и забыть
	                element.innerHTML = "";
	            break;
	        }

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
	                this.$injectors.$scope.attributes[camelize(element.attributes[z].name)] = value;
	                if (element.attributes[z].name.substr(0,5)==='data-') {

	                    this.$injectors.$scope.properties[camelize(element.attributes[z].name.substr(5))] = value;
	                }
	            }

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
	            Переносим callback для attributeChanged
	            */
	            for (var i = 0;i<component.onAttributeChangedCallbacks.length;++i) {
	                this.on("attributeChanged", component.onAttributeChangedCallbacks[i]);
	            }

	            var evalWatchers = function() {

	                /*
	                Переносим наблюдение за scope
	                 */
	                for (var i = 0;i<component.watchers.length;++i) {
	                    this.$watch.apply(this, component.watchers[i]);
	                }
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
	            //this.bubbling('shake'); // Shake all roots

	        });

	    }.inherit(WebElementPrototype);

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	
		var getObjectByXPath = __webpack_require__(17);
		var smartCallback = __webpack_require__(5);
		var classEvents = __webpack_require__(4);
		var getNonScopeValue = __webpack_require__(18);
		var Box = __webpack_require__(19);
		var camelize = __webpack_require__(6);
		var dasherize = __webpack_require__(20);
		__webpack_require__(11);

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

			this.$$applyPortions = {
				applies: [],
				timer: 0
			}
		}.inherit(classEvents)
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
				if (self.$injectors.$component.options.engine.name==='angular'&&Synthetic.$$angularApp)
				{
					for (var x = 0;x<requiredProperties.length;++x) {
						
						if (requiredProperties[x][0]==='properties'||requiredProperties[x][0]==='attributes') {
							attrn = requiredProperties[x][0]==='properties'?'data'+requiredProperties[x][1].charAt(0).toUpperCase()+requiredProperties[x][1].substr(1):requiredProperties[x][1];
							
							alldata.push(getNonScopeValue(self.$element.getAttribute(dasherize(attrn))));
						} else {
							alldata.push(getNonScopeValue(self.$injectors.$scope.$eval(requiredProperties[x].join('.'))));
						}
					}
				} else {
					for (var x = 0;x<requiredProperties.length;++x) {
						alldata.push(getNonScopeValue(getObjectByXPath(self.$injectors.$scope, requiredProperties[x])));
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
			$watch: function() {
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
								if (self.$injectors.$component.options.engine.name==='angular'&&Synthetic.$$angularApp) {
									alldata.push(getNonScopeValue(self.$injectors.$scope.$eval(requiredProperties[x].join('.'))));
								} else {
									alldata.push(getNonScopeValue(getObjectByXPath(self.$injectors.$scope, requiredProperties[x])));
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

					if (self.$injectors.$component.options.engine.name==='angular'&&Synthetic.$$angularApp) { //&&self.__config__.$$angularInitialedStage>1

						
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
										self.$injectors.$scope.attributes[attrn] = value; 
										if (dashed.substr(0, 5) === "data-") { 
											self.$injectors.$scope.properties[camelize(dashed.substr(5))] = value; 
										} 
									} else { 
										self.bind("attached", function() { 
											var dashed = dasherize(attrn), 
											value = self.$element.getAttribute(dashed); 
											if (null===value) value = Synthetic.config.undefinedAttributeDefaultValue;
											compiledCallbacker.call(self, false, "set", value); 
											self.$injectors.$scope.attributes[attrn] = value; 
										if (dashed.substr(0, 5) === "data-") { 
											self.$injectors.$scope.properties[camelize(dashed.substr(5))] = value; 
										} 
										}, true); 
									}
								}
								self.$$attrsWatchers[attrn].push(compiledCallbacker);

								

							} else {
								var unwatcher = self.$injectors.$scope.$watch(rprops.join('.'), function(newValue) {
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

					unwacthers = unwacthers.inherit(watchFabric(requiredProperties[i], getObjectByXPath(this.$injectors.$scope, requiredProperties[i].slice(0, requiredProperties[i].length-1)), requiredProperties[i][requiredProperties[i].length-1]));
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
					var self = this, injected = smartCallback.call($injectors ? [self.$injectors, $injectors] : self.$injectors, callback, self);
					return function() {
						var nargs = Array.prototype.slice.apply(arguments),context=this;
						return injected.apply(context, nargs);
					}				
				} else {
					return smartCallback.call("object"===typeof $injectors ? [this.$injectors, $injectors] : this.$injectors, callback, this);
				}
				
			},
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
					return this.on(this.__config__.allWaitingForResolve, function() {
						if (self.$destroyed) return false;
						callback.apply(this, arguments);
					}, true);
				} else {

					return callback.apply(this);
				}
			},
			$digest: function(expr) {
				this.$injectors.$scope.$evalAsync(expr);
			},
			$apply: function($as, callback, destructor){
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

				

				if (this.$injectors.$component.options.engine.name==='angular'&&Synthetic.$$angularApp)
				this.$scope.$applyAsync(realCallback);
				else
				setTimeout(realCallback);
			},
			
			$template: function(content) {
				return this.$injectors.$generator.template(content);
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
	            this.$injectors.$generator.destroy();

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

				this.$injectors.$generator.destroy();
				this.$injectors.$generator = null;
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
/* 17 */
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
/* 18 */
/***/ function(module, exports) {

	module.exports = function(newValue) {
		// TODO: can we call this staff only when data is compiled???
		//if (/^{{[^}}]*}}$/.test(newValue)) console.error('Scopes detected', newValue);
		return /^{{[^}}]*}}$/i.test(newValue)||newValue===undefined ? undefined : newValue;
	};

/***/ },
/* 19 */
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
/* 20 */
/***/ function(module, exports) {

	module.exports = function(text) {
		return text.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
	};

/***/ },
/* 21 */
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
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	
	    var classEvents = __webpack_require__(4);
	    var synthetModule = __webpack_require__(23);


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
	                this.watchers.push(angular.element(synthet.$injectors.$element).scope().$watch(function(){
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
	                        $.$.$injectors.$element.innerHTML = $.$.$injectors.$element.innerHTML = minTemplate($.configuration.template, $.$.$injectors.$scope);
	                        
	                        resolve($.$.$injectors.$element);

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
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(11);
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
/* 24 */
/***/ function(module, exports) {

	/*! (C) WebReflection Mit Style License */
	(function(e,t,n,r){"use strict";function rt(e,t){for(var n=0,r=e.length;n<r;n++)vt(e[n],t)}function it(e){for(var t=0,n=e.length,r;t<n;t++)r=e[t],nt(r,b[ot(r)])}function st(e){return function(t){j(t)&&(vt(t,e),rt(t.querySelectorAll(w),e))}}function ot(e){var t=e.getAttribute("is"),n=e.nodeName.toUpperCase(),r=S.call(y,t?v+t.toUpperCase():d+n);return t&&-1<r&&!ut(n,t)?-1:r}function ut(e,t){return-1<w.indexOf(e+'[is="'+t+'"]')}function at(e){var t=e.currentTarget,n=e.attrChange,r=e.attrName,i=e.target;Q&&(!i||i===t)&&t.attributeChangedCallback&&r!=="style"&e.prevValue!==e.newValue&&t.attributeChangedCallback(r,n===e[a]?null:e.prevValue,n===e[l]?null:e.newValue)}function ft(e){var t=st(e);return function(e){X.push(t,e.target)}}function lt(e){K&&(K=!1,e.currentTarget.removeEventListener(h,lt)),rt((e.target||t).querySelectorAll(w),e.detail===o?o:s),B&&pt()}function ct(e,t){var n=this;q.call(n,e,t),G.call(n,{target:n})}function ht(e,t){D(e,t),et?et.observe(e,z):(J&&(e.setAttribute=ct,e[i]=Z(e),e.addEventListener(p,G)),e.addEventListener(c,at)),e.createdCallback&&Q&&(e.created=!0,e.createdCallback(),e.created=!1)}function pt(){for(var e,t=0,n=F.length;t<n;t++)e=F[t],E.contains(e)||(n--,F.splice(t--,1),vt(e,o))}function dt(e){throw new Error("A "+e+" type is already registered")}function vt(e,t){var n,r=ot(e);-1<r&&(tt(e,b[r]),r=0,t===s&&!e[s]?(e[o]=!1,e[s]=!0,r=1,B&&S.call(F,e)<0&&F.push(e)):t===o&&!e[o]&&(e[s]=!1,e[o]=!0,r=1),r&&(n=e[t+"Callback"])&&n.call(e))}if(r in t)return;var i="__"+r+(Math.random()*1e5>>0),s="attached",o="detached",u="extends",a="ADDITION",f="MODIFICATION",l="REMOVAL",c="DOMAttrModified",h="DOMContentLoaded",p="DOMSubtreeModified",d="<",v="=",m=/^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+$/,g=["ANNOTATION-XML","COLOR-PROFILE","FONT-FACE","FONT-FACE-SRC","FONT-FACE-URI","FONT-FACE-FORMAT","FONT-FACE-NAME","MISSING-GLYPH"],y=[],b=[],w="",E=t.documentElement,S=y.indexOf||function(e){for(var t=this.length;t--&&this[t]!==e;);return t},x=n.prototype,T=x.hasOwnProperty,N=x.isPrototypeOf,C=n.defineProperty,k=n.getOwnPropertyDescriptor,L=n.getOwnPropertyNames,A=n.getPrototypeOf,O=n.setPrototypeOf,M=!!n.__proto__,_=n.create||function mt(e){return e?(mt.prototype=e,new mt):this},D=O||(M?function(e,t){return e.__proto__=t,e}:L&&k?function(){function e(e,t){for(var n,r=L(t),i=0,s=r.length;i<s;i++)n=r[i],T.call(e,n)||C(e,n,k(t,n))}return function(t,n){do e(t,n);while((n=A(n))&&!N.call(n,t));return t}}():function(e,t){for(var n in t)e[n]=t[n];return e}),P=e.MutationObserver||e.WebKitMutationObserver,H=(e.HTMLElement||e.Element||e.Node).prototype,B=!N.call(H,E),j=B?function(e){return e.nodeType===1}:function(e){return N.call(H,e)},F=B&&[],I=H.cloneNode,q=H.setAttribute,R=H.removeAttribute,U=t.createElement,z=P&&{attributes:!0,characterData:!0,attributeOldValue:!0},W=P||function(e){J=!1,E.removeEventListener(c,W)},X,V=e.requestAnimationFrame||e.webkitRequestAnimationFrame||e.mozRequestAnimationFrame||e.msRequestAnimationFrame||function(e){setTimeout(e,10)},$=!1,J=!0,K=!0,Q=!0,G,Y,Z,et,tt,nt;O||M?(tt=function(e,t){N.call(t,e)||ht(e,t)},nt=ht):(tt=function(e,t){e[i]||(e[i]=n(!0),ht(e,t))},nt=tt),B?(J=!1,function(){var e=k(H,"addEventListener"),t=e.value,n=function(e){var t=new CustomEvent(c,{bubbles:!0});t.attrName=e,t.prevValue=this.getAttribute(e),t.newValue=null,t[l]=t.attrChange=2,R.call(this,e),this.dispatchEvent(t)},r=function(e,t){var n=this.hasAttribute(e),r=n&&this.getAttribute(e),i=new CustomEvent(c,{bubbles:!0});q.call(this,e,t),i.attrName=e,i.prevValue=n?r:null,i.newValue=t,n?i[f]=i.attrChange=1:i[a]=i.attrChange=0,this.dispatchEvent(i)},s=function(e){var t=e.currentTarget,n=t[i],r=e.propertyName,s;n.hasOwnProperty(r)&&(n=n[r],s=new CustomEvent(c,{bubbles:!0}),s.attrName=n.name,s.prevValue=n.value||null,s.newValue=n.value=t[r]||null,s.prevValue==null?s[a]=s.attrChange=0:s[f]=s.attrChange=1,t.dispatchEvent(s))};e.value=function(e,o,u){e===c&&this.attributeChangedCallback&&this.setAttribute!==r&&(this[i]={className:{name:"class",value:this.className}},this.setAttribute=r,this.removeAttribute=n,t.call(this,"propertychange",s)),t.call(this,e,o,u)},C(H,"addEventListener",e)}()):P||(E.addEventListener(c,W),E.setAttribute(i,1),E.removeAttribute(i),J&&(G=function(e){var t=this,n,r,s;if(t===e.target){n=t[i],t[i]=r=Z(t);for(s in r){if(!(s in n))return Y(0,t,s,n[s],r[s],a);if(r[s]!==n[s])return Y(1,t,s,n[s],r[s],f)}for(s in n)if(!(s in r))return Y(2,t,s,n[s],r[s],l)}},Y=function(e,t,n,r,i,s){var o={attrChange:e,currentTarget:t,attrName:n,prevValue:r,newValue:i};o[s]=e,at(o)},Z=function(e){for(var t,n,r={},i=e.attributes,s=0,o=i.length;s<o;s++)t=i[s],n=t.name,n!=="setAttribute"&&(r[n]=t.value);return r})),t[r]=function(n,r){c=n.toUpperCase(),$||($=!0,P?(et=function(e,t){function n(e,t){for(var n=0,r=e.length;n<r;t(e[n++]));}return new P(function(r){for(var i,s,o,u=0,a=r.length;u<a;u++)i=r[u],i.type==="childList"?(n(i.addedNodes,e),n(i.removedNodes,t)):(s=i.target,Q&&s.attributeChangedCallback&&i.attributeName!=="style"&&(o=s.getAttribute(i.attributeName),o!==i.oldValue&&s.attributeChangedCallback(i.attributeName,i.oldValue,o)))})}(st(s),st(o)),et.observe(t,{childList:!0,subtree:!0})):(X=[],V(function E(){while(X.length)X.shift().call(null,X.shift());V(E)}),t.addEventListener("DOMNodeInserted",ft(s)),t.addEventListener("DOMNodeRemoved",ft(o))),t.addEventListener(h,lt),t.addEventListener("readystatechange",lt),t.createElement=function(e,n){var r=U.apply(t,arguments),i=""+e,s=S.call(y,(n?v:d)+(n||i).toUpperCase()),o=-1<s;return n&&(r.setAttribute("is",n=n.toLowerCase()),o&&(o=ut(i.toUpperCase(),n))),Q=!t.createElement.innerHTMLHelper,o&&nt(r,b[s]),r},H.cloneNode=function(e){var t=I.call(this,!!e),n=ot(t);return-1<n&&nt(t,b[n]),e&&it(t.querySelectorAll(w)),t}),-2<S.call(y,v+c)+S.call(y,d+c)&&dt(n);if(!m.test(c)||-1<S.call(g,c))throw new Error("The type "+n+" is invalid");var i=function(){return f?t.createElement(l,c):t.createElement(l)},a=r||x,f=T.call(a,u),l=f?r[u].toUpperCase():c,c,p;return f&&-1<S.call(y,d+l)&&dt(l),p=y.push((f?v:d)+c)-1,w=w.concat(w.length?",":"",f?l+'[is="'+n.toLowerCase()+'"]':l),i.prototype=b[p]=T.call(a,"prototype")?a.prototype:_(H),rt(t.querySelectorAll(w),s),i}})(window,document,Object,"registerElement");

/***/ }
/******/ ])
});
;