define([
	"./getObjectByXPath.js",
	"./d3party/watchJS/watch.js",
	"./smartCallback.js",
	"./classEvents.js",	
    './templaters/min.js', // Must lite templater
    './templaters/angular.js', // Angular templater
    "polyvitamins~polyinherit@master",
],
function(getObjectByXPath, watchJS, smartCallback, classEvents, minTemplate, angularTemplate) {
	/*
	Модифицируем стандартный classEvents
	*/
	return function() {

	}.inherit(classEvents)
	.proto({
		watch: function() {
			/*
			Проверка задержки
			*/
			if (this.__config__.allWaitingForResolve) {

				/*
				В случае, если система ожидает инициализации какого то приложения,
				функции прослушивания переменных задерживаются до инициализации
				*/
				
				this.bind(this.__config__.allWaitingForResolve, function(args) {

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
			/*
			Начинаем наблюдение за переменной
			*/
			var getDatas = function(requiredProperties, rprops) {
				return function(prop, action, newValue) {

					var alldata = [];
					for (var x = 0;x<requiredProperties.length;++x) {
						if (rprops===requiredProperties[x])
						alldata.push(newValue);
						else
						alldata.push(getObjectByXPath(self.__selfie__.$scope, requiredProperties[x]));
					}

					self.$inject(callback).apply(self, alldata);
				}
			};

			getDatas.call(self, requiredProperties, false).call(self);
			var watchFabric = function(rprops, wobject, prop) {
				
				if ("undefined"===typeof wobject[prop]) wobject[prop] = false;
				if (Synthetic.$$angularApp) { //&&self.__config__.$$angularInitialedStage>1
					try {
						angular.element(self.__selfie__.$element).scope().$watch(rprops.join('.'), function(newValue) {
							
							this.call(self, false, 'set', newValue);						
						}.bind(getDatas(requiredProperties, rprops)));
					} catch(e) {
						console.error('Errors', self.__config__.$$angularInitialedStage);
						
					}
				} else {
					watchJS.watch(
						wobject, 
						prop, 
						getDatas(requiredProperties, rprops)
					)
				};
			};
			for (var i = 0;i<requiredProperties.length;++i) {
				
				watchFabric(requiredProperties[i], getObjectByXPath(this.__selfie__.$scope, requiredProperties[i].slice(0, requiredProperties[i].length-1)), requiredProperties[i][requiredProperties[i].length-1]);
			}
		},
		/*
		Анализирует пользовательскую функцию и внедряет в нее системные аргументы. Так например
		function($scope) {} - передаст в функцию $scope компонента
		Родные аргументы смещаются вправо
		В случае интеграции с angularjs функция так же обертывается в $timeout
		*/
		$inject: function(callback) {
			if (Synthetic.$$angularApp&&this.__config__.$$angularScope) {
				var self = this;
				return function() {
					var nargs = Array.prototype.slice.apply(arguments),context=this;
					self.__config__.$$angularTimeout(function() {
						smartCallback.call(self.__selfie__, callback).apply(context, nargs);
					});
				}				
			} else {
				return smartCallback.call(this.__selfie__, callback);
			}
			
		},
		/*
		Добавляет функцию в очередь. Она будет выполнена когда компонент будет
		готов принимать обработчики и вочеры.
		*/
		$queue: function(callback) {
			if (this.__config__.allWaitingForResolve) {
				console.log('Add to resolve waiter', this.__config__.allWaitingForResolve);
				this.bind(this.__config__.allWaitingForResolve, callback);
			} else {
				callback.apply(this);
			}
			return this;
		},
		template: function(source, engine, buildOn) {
			console.log('WTF');
			this.__config__.generator = {
				template: source,
				engine: engine||'min',
				buildOn: buildOn||['created']
			}
			
			this.__generateHtml__();
		},
        /*
		Эта функция генерирует HTML
        */
        __generateHtml__ : function() {
        	
        	if (this.__config__.generator) {
        		switch(this.__config__.generator.engine) {
        			case 'angular':

        				if (this.__config__.$$angularInitialedStage>1) {
        					this.$inject(function($self) {
        						
        						var test = $self.__config__.$$angularCompile($self.__config__.generator.template)($self.__config__.$$angularScope);
        						$self.__config__.$$angularElement.append(test);
        					})();

        					console.log('injected', this.__config__.generator.template);
        					
        				} else {
        					this.__selfie__.$element.innerHTML = this.__config__.generator.template;
        				}
        			break;
        			case "min":
        			default:
        				this.__selfie__.$element.innerHTML = minTemplate(this.__config__.generator.template, this.__selfie__.$scope);
        			break;
        		}
        	}
        }
	});
});