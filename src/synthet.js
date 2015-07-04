/*
AMD Synthet
*/
(function(name, depends, factory) {
	if (window && window.define && "function"===typeof define) define(name, depends, factory)
	else {
		
		window.Synthet = factory();
	}
})
("synthet", [
	"abstudio~subzero@0.1.0",
	"abstudio~inherit@0.1.0",
	"abstudio~eventsClass@0.1.0",
	"./d3party/WebReflection/document-register-element.amd.js"
], function(subZero, inherit, eventsClass) {

	var Component = inherit(function() {

	}, eventsClass);

	var Synthet = function() {

	};

	Synthet.prototype = {
		construct: Synthet
	}

	Synthet.registerComponent = function(name, template, config) {
		/*
		Сбрасываем ошибку, если в имени нету деффиса
		*/
		if (name.indexOf('-')<0) throw 'Component name must have `-` symbol';
		/*
		Создаем новый компонент
		*/
		var component = new Component();
		/*
		Регистрируем касмотный элемент через полифил
		*/
		var prototype = {
		    prototype: Object.create(
		      HTMLElement.prototype, {
		      createdCallback: {value: function() {
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
		};
		component.element = document.registerElement(name, prototype);

		return component;
	}

	return Synthet;

});