/*
AMD Synthet
*/
(function(name, depends, factory) {
	if (define && "function"===typeof define) define(name, depends, factory);
	
})
("synthet", [
	"abstudio~mutagen@0.1.3",
	"abstudio~inherit@0.1.2",
	"abstudio~classEvents@0.1.0",
	"./d3party/WebReflection/document-register-element.amd.js"
], function(mutagen, inherit, eventsClass) {

	var Component = inherit(function(name) {
		this.name = name;
		this.$ = null;
		this.template = '';
	}, eventsClass);
	/*
	Устанавливает шаблон для элемента
	*/
	Component.prototype.setTemplate = function(template) {
		this.template = template;
		this.on('created', function(element) {
			mutagen.call(this.template, element);
		});
	}
	/*
	Регистриует элемент в документе
	*/
	Component.prototype.register = function() {
		var component = this;
		/*
		Регистрируем касмотный элемент через полифил
		*/
		document.registerElement(this.name, {
		    prototype: Object.create(
		      HTMLElement.prototype, {
		      query: {
		      	value: function(queryString) {
		      		var nodeList = mutagen.query(queryString, this);
		      		if (nodeList instanceof NodeList) {
		      			return Array.prototype.slice.apply(nodeList);
		      		} else {
		      			return [];
		      		}
		      	}
		      },
		      createdCallback: {value: function() {
		      	component.$ = this;
		      	component.trigger('created',[this]);
		      }},
		      attachedCallback: {value: function() {
		        component.trigger('attached',[this]);
		      }},
		      detachedCallback: {value: function() {
		        component.trigger('detached',[this]);
		      }},
		      attributeChangedCallback: {value: function(
		        name, previousValue, value
		      ) {
		      	component.trigger('attributeChanged',[name, previousValue, value]);
		      }}
		    })
		});
	}

	var Synthet = function() {

	};

	Synthet.prototype = {
		construct: Synthet
	}

	Synthet.newComponent = function(name, template) {
		/*
		Сбрасываем ошибку, если в имени нету деффиса
		*/
		if (name.indexOf('-')<0) throw 'Component name must have `-` symbol';
		/*
		Создаем новый компонент
		*/
		var component = new Component(name);
		component.setTemplate(template);

		return component;
	}

	if (window) window.Synthet = Synthet;
	return Synthet;

});