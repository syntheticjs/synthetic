define([
	"./getObjectByXPath.js",
	"./d3party/watchJS/watch.js",
	"./smartCallback.js",
	"./classEvents.js",	
	"polyvitamins~polychrome@master/gist/convert/camelize.js",
    "polyvitamins~polyinherit@master",
],
function(getObjectByXPath, watchJS, smartCallback, classEvents, camelize) {
	var getNonScopeValue = function(newValue) {
		return /^{{[^}}]*}}$/i.test(newValue) ? false : newValue;
	}
	/*
	Модифицируем стандартный classEvents
	*/
	return function() {
		/*
		Этот массив содержит объекты с методом unwatch на каждое из наблюдений
		*/
		this.$watchersHistory = [];
	}.inherit(classEvents)
	.proto({
		read: function() {
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
			requiredProperties = [];
			
			for (var i = 0;i<properties.length;++i) {
				requiredProperties.push(xpath.concat(properties[i].split('.')));
			}

			var alldata = [];
			for (var x = 0;x<requiredProperties.length;++x) {
				alldata.push(getNonScopeValue(getObjectByXPath(self.$injectors.$scope, requiredProperties[x])));
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
		watch: function() {

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
			
			/*
			Формируем полные пути свойств
			*/
			var xpath = objectXPath?objectXPath.split('.'):[];
			requiredProperties = [];
			
			for (var i = 0;i<properties.length;++i) {
				requiredProperties.push(xpath.concat(properties[i].split('.')));
			}
			var lastTrack = {}; // Последнее состояние срабатываения
			/*
			Начинаем наблюдение за переменной
			*/
			var getDatas = function(requiredProperties, rprops) {
				return function(prop, action, newValue) {
					
					var alldata = [];
					for (var x = 0;x<requiredProperties.length;++x) {
						if (rprops===requiredProperties[x])
						alldata.push(getNonScopeValue(newValue));
						else
						alldata.push(getNonScopeValue(getObjectByXPath(self.$injectors.$scope, requiredProperties[x])));
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
				if (Synthetic.$$angularApp) { //&&self.__config__.$$angularInitialedStage>1
					var compiledCallbacker = getDatas(requiredProperties, rprops);
					try {
						console.log("%cwatch", "font-weight:bold;", self.$element, rprops.join('.'));
						var unwatcher = self.$injectors.$scope.$watch(rprops.join('.'), function(newValue) {
						
						this.call(self, false, 'set', newValue);
						}.bind(compiledCallbacker))
						self.$watchersHistory.push({
							"unwatch": unwatcher
						});
						
					} catch(e) {
						window.teste = self.$injectors.$element;
						console.error('Errors', e, self.$injectors.$element);
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
			var unwacthers = function() {}; // Эта функция будет содержат функции для уничтожения наблюдений
			for (var i = 0;i<requiredProperties.length;++i) {
				
				unwacthers.inherit(watchFabric(requiredProperties[i], getObjectByXPath(this.$injectors.$scope, requiredProperties[i].slice(0, requiredProperties[i].length-1)), requiredProperties[i][requiredProperties[i].length-1]));
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
					smartCallback.call(self.$injectors, callback, self).apply(context, nargs);
				}				
			} else {
				return smartCallback.call(this.$injectors, callback, this);
			}
			
		},
		$injector: function(cb) {
			return $inject(cb)();
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
		$apply: function(callback){
			Synthetic.$$angularTimeout(this.$inject(callback));
		},
		$template: function(content) {
			this.$injectors.$generator.template(content);
		},
		$destroy: function() {
			
			if (this.$destroyed) return true;
			this.$destroyed = true;
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
			Удаляем generator
			*/
			this.$injectors.$generator.destroy();
			this.$injectors.$generator = null;
			/*
			Удаляем привязку объекта к элементу
			*/
			this.$injectors.$element.synthetic = null;
			/*
			Очищаем собственные данные конфигурации
			*/
			this.__config__ = {};
		}
	});
});