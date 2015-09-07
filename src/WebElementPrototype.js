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

					smartCallback.call(self.__selfie__, callback).apply(self, alldata);
				}
			};

			getDatas.call(self, requiredProperties, false).call(self);
			var watchFabric = function(rprops, wobject, prop) {
				
				if ("undefined"===typeof wobject[prop]) wobject[prop] = false;
				if (self.__config__.angulared) {
					angular.element(self.synthetic.__selfie__.$element).scope().$watch(rprops, function(newValue) {
						getDatas(requiredProperties, rprops)(false, false, newValue);
					});
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
		template: function(source, engine, buildOn) {
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
        	console.log('generate html', this.__config__.generator);
        	if (this.__config__.generator) {
        		switch(this.__config__.generator.engine) {
        			case 'angular':
        				this.__selfie__.$element.innerHTML = this.__config__.generator.template;
        				
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