define([
	"./getObjectByXPath.js",
	"./d3party/watchJS/watch.js",
	"./smartCallback.js",
	"abstudio~mutagen@0.1.10",
	"./classEvents.js",
    "polyvitamins~polyinherit@master",
],
function(getObjectByXPath, watchJS, smartCallback, mutagen, classEvents) {
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
			var getDatas = function() {
				var alldata = [];
				for (var x = 0;x<requiredProperties.length;++x) {
					alldata.push(getObjectByXPath(self.operands.$scope, requiredProperties[x]));
				}

				smartCallback.call(self.operands, callback).apply(self, alldata);
			};

			getDatas.call(self);

			for (var i = 0;i<requiredProperties.length;++i) {
				
				watchJS.watch(
					getObjectByXPath(this.operands.$scope, requiredProperties[i].slice(0, requiredProperties.length-1)), 
					requiredProperties[i][requiredProperties[i].length-1], 
					getDatas
				)
			}
		},
		query : function(queryString) {
            var nodeList = mutagen.query(queryString, this.operands.$element);
            if (nodeList instanceof NodeList || nodeList instanceof Array) {
                return Array.prototype.slice.apply(nodeList);
            } else {
                return [];
            }
        },
        template : function(template, defaultPlaceholders) {
            this.template = [template, defaultPlaceholders||{}];
            this.on("created", function(module) {
                mutagen.call(this.template[0], module.operands.$element, function(replacings) {
                    for (var prop in defaultPlaceholders) {
                        if (defaultPlaceholders.hasOwnProperty(prop)) replacings['{{'+prop+'}}'] = defaultPlaceholders[prop];
                    }
                });
            });
            return this;
        }
	});
});