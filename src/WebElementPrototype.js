define([
	"./getObjectByXPath.js",
	"./d3party/watchJS/watch.js",
	"./smartCallback.js",
	"./classEvents.js",	
    './templaters/min.js', // Must lite templater
    "polyvitamins~polyinherit@master",
],
function(getObjectByXPath, watchJS, smartCallback, classEvents, minTemplate) {
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
				watchJS.watch(
					wobject, 
					prop, 
					getDatas(requiredProperties, rprops)
				)
			};
			for (var i = 0;i<requiredProperties.length;++i) {
				
				watchFabric(requiredProperties[i], getObjectByXPath(this.__selfie__.$scope, requiredProperties[i].slice(0, requiredProperties[i].length-1)), requiredProperties[i][requiredProperties[i].length-1]);
			}
		},
		query : function(queryString) {
            var nodeList = mutagen.query(queryString, this.__selfie__.$element);
            if (nodeList instanceof NodeList || nodeList instanceof Array) {
                return Array.prototype.slice.apply(nodeList);
            } else {
                return [];
            }
        },
        template : function(template, defaultPlaceholders) {
            this.template = [template, defaultPlaceholders||{}];
            this.on("created", function(module) {
                mutagen.call(this.template[0], module.__selfie__.$element, function(replacings) {
                    for (var prop in defaultPlaceholders) {
                        if (defaultPlaceholders.hasOwnProperty(prop)) replacings['{{'+prop+'}}'] = defaultPlaceholders[prop];
                    }
                });
            });
            return this;
        },
        /*
		Эта функция генерирует HTML
        */
        __generateHtml__ : function() {

        	if (this.__config__.generator) {
        		switch(this.__config__.generator.engine) {
        			case "min":
        			default:
        				
        				this.__selfie__.$element.innerHTML = minTemplate(this.__config__.generator.template, this.__selfie__.$scope);
        			break;
        		}
        	}
        }
	});
});