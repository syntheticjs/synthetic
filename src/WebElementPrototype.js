define([
	"./getObjectByXPath.js",
	"./smartCallback.js",
	"./classEvents.js",	
	"polyvitamins~polychrome@master/gist/convert/camelize.js",
	"./getNonScopeValue.js",
	"./box.js",
    "polyvitamins~polyinherit@master",
],
function(getObjectByXPath, smartCallback, classEvents, camelize, getNonScopeValue, Box) {
	
	/*
	Модифицируем стандартный classEvents
	*/
	return function() {
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
						
						alldata.push(getNonScopeValue(self.$element.getAttribute(sx.utils.dasherize(attrn))));
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
				console.log('wait for resolve', this.__config__.allWaitingForResolve);
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



			/*
			Начинаем наблюдение за переменной
			*/
			var getDatas = function(requiredProperties, rprops, $unwatcher) {
				
				var injectedCallback = self.$inject(callback, {
					$unwatch: $unwatcher,
					$box: new Box()
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
				
				if ("undefined"===typeof wobject[prop]) wobject[prop] = false;

				// Обнуляем snaps
				self.$scopeSnaps[JSON.stringify(requiredProperties)] = false;

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
									//debugger;
									compiledCallbacker.call(self, false, 'set', self.$element.getAttribute(sx.utils.dasherize(attrn)));
								} else {
									self.bind('attached', function() {
										compiledCallbacker.call(self, false, 'set', self.$element.getAttribute(sx.utils.dasherize(attrn)));
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
				return this.bind(this.__config__.allWaitingForResolve, function() {
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
			this.$injectors.$generator.template(content);
			return this;
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
				this.$element.remove();
			}
		},
		/*
		Данная функция выполняет некую процедуру, остаточные объектвы которые будут удалены
		возвращаемой функцийей
		*/
		$hitch: function(cb, keys) {
			var fkey = cb.toString()+("object"===typeof keys ? JSON.stringify(keys) : (keys ? keys.toString() : '') );
            if ("function"===typeof this.$hitchers[fkey]) this.$hitchers[fkey].call(this);
            this.$hitchers[fkey] = this.$run(cb);
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
});