define([
	"./getObjectByXPath.js",
	"./d3party/watchJS/watch.js",
	"./smartCallback.js",
	"./classEvents.js",	
	"polyvitamins~polychrome@master/gist/convert/camelize.js",
	"./getNonScopeValue.js",
    "polyvitamins~polyinherit@master",
],
function(getObjectByXPath, watchJS, smartCallback, classEvents, camelize, getNonScopeValue) {
	
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
	}.inherit(classEvents)
	.proto({
		$read: function() {
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
					alldata.push(getNonScopeValue(self.$injectors.$scope.$eval(requiredProperties[x].join('.'))));
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
			
			
			
			self.$inject(callback).apply(self, alldata);
		},
		$watch: function() {

			/*
			Проверка задержки
			*/
			if (this.__config__.allWaitingForResolve) {

				/*
				В случае, если система ожидает инициализации какого то приложения,
				функции прослушивания переменных задерживаются до инициализации
				*/
				this.$queue(function(args) {
					this.watch.apply(this, args);
				}.bind(this, arguments));
				return;
			}

			/*
			Start watching ***
			*/
			var self=this,objectXPath=false, properties, callback;
			;(arguments.length>2) ? (objectXPath=arguments[0],properties=arguments[1],callback=arguments[2]) : (properties=arguments[0],callback=arguments[1]);
			
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
            Если рендеринг уже произошел, то нам, помимо наблюдения, необходимо выполнить чтение немедленно,
            что бы обработка данных могла произойти не дождидаясь их изменения. Это нужно потому что
            к моменту рендеринга как правило все данные уже устанавлиаются и простое выполнение watch
            не вызовет callback.
            */
            if (this.__config__.rendered)
            this.$read.apply(this, Array.prototype.slice.apply(arguments));

			/*
			Начинаем наблюдение за переменной
			*/
			var getDatas = function(requiredProperties, rprops) {
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
					
					self.$inject(callback).apply(self, alldata);
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
					var compiledCallbacker = getDatas(requiredProperties, rprops);



					try {

						var unwatcher = self.$injectors.$scope.$watch(rprops.join('.'), function(newValue) {

							this.call(self, false, 'set', newValue);
						}.bind(compiledCallbacker));

						/*
						Что бы ускорить работу вочеров при обращении к аттрибутом, помимо вочеров angular мы дополняем их собственными
						вочерами, основанными на событиях.
						Вметсе с этой методом прослушивания создается и функция самоуничтожения
						TODO: придумать другой способ самоуничтожения, отличный от null
						*/
						if (rprops[0]==='properties'||rprops[0]==='attributes') {
							var attrn = rprops[0]==='properties'?'data'+rprops[1].charAt(0).toUpperCase()+rprops[1].substr(1):rprops[1];
							if ("object"!==typeof self.$$attrsWatchers[attrn]) self.$$attrsWatchers[attrn] = [];
							self.$$attrsWatchers[attrn].push(compiledCallbacker);
							self.$watchersHistory.push({
								"unwatch": function(i) {
									this[i] = null;
								}.bind(self.$$attrsWatchers[attrn], self.$$attrsWatchers[attrn].length-1)
							});
						}
						

						self.$watchersHistory.push({
							"unwatch": unwatcher
						});
						
					} catch(e) {
						window.teste = self.$injectors.$element;
						console.error('Errors', e, rprops, wobject, self.$injectors.$element);
					}
					
					return unwatcher;
				} else {

					/*
					Запоминаем обработчики, что бы потом можно было их всех затереть
					*/
					var watchi = {
						"object": wobject, 
						"property": prop,
						"callback": getDatas(requiredProperties, rprops)
					};
					
					
					var unwatcher = function() {
							watchJS.unwatch(this.object, this.prop, this.callback);
						}.bind(watchi);
					self.$watchersHistory.push({
						"unwatch": unwatcher
					});
					
					watchJS.watch(
						watchi.object,
						watchi.property,
						watchi.callback
					);

					return unwatcher;
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
		$inject: function(callback) {
			if (Synthetic.$$angularApp&&this.__config__.$$angularScope&&this.__config__.$$angularInitialedStage>1) {
				var self = this;
				return function() {
					var nargs = Array.prototype.slice.apply(arguments),context=this;
					return smartCallback.call(self.$injectors, callback, self).apply(context, nargs);
				}				
			} else {
				return smartCallback.call(this.$injectors, callback, this);
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
				this.bind(this.__config__.allWaitingForResolve, function() {
					if (self.$destroyed) return false;
					callback.apply(this, arguments);
				});
			} else {

				callback.apply(this);
			}
			return this;
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
			Synthetic.$$angularTimeout(realCallback);
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
		$hitch: function(cb) {
			var fkey = cb.toString();
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