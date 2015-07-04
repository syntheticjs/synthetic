/* 
==ZubZero wins==

Html smart parser for replacing one html chunks to other html content.
See more info on http://github.com/abstudio/subzero

Author: Vladimir Kalmykov (Morulus)
Email: vladimirmorulus@gmail.com
MIT License 2015
*/

/*
QuerySelector polyfill
*/
(function(name, depends, factory) {
	if (window && window.define && "function"===typeof define && define.amd) define(name, depends, factory)
	else {
		String.prototype.mutate = factory();
	}
})
("subzero", [], function() {
	
	var regPseudoClasssDt = /:(eq|nth\-child)\(([0-9n\+ ]+)\)/ig,
	queryExpr = /<([a-zA-Z0-9_]+) \/>/i,
	argsExpr = /\[([a-zA-Z0-9_\-]*)[ ]?=([ ]?[^\]]*)\]/i;
	
		/*
		Выборка элементов соответствующих псевдо-селектору
		*/
		var psopi = {
			"eq": function(elements, attrs) {
				var index;
				if (!isNaN(index = parseInt(attrs[2]))) {
					return [(index<0 && index*-1<elements.length) ? elements[elements.length-index] :
					(index<elements.length ? elements[index] : [])];
				} else {
					return [];
				}
			},
			"nth-child": function(elements, attrs) {

				var n=false,i=0,rec=[],index;
				if (!isNaN(index = parseInt(attrs[2]))) {

					n=attrs[2].indexOf('n')>=0;
					for (;i<elements.length;i++) {
						if (!n&&i===index) rec.push(elements[i]);
						if (n&&i%index===0) rec.push(elements[i]);
					}
				} else {

					return [];
				}
				return rec;
			}
		}
		var pseusoSelect = function(elements, selector) {
			var psop = regPseudoClasssDt.exec(selector);

			if ("function"!==typeof psopi[psop[1]]) {
				return [];
			} else {
				return psopi[psop[1]](elements, psop);
			}
		},
		each = function(subject, fn) {
			for (var prop in subject) {
				if (subject.hasOwnProperty(prop)) {
					fn.call(subject, subject[prop], prop);
				}
			}
		},
		extendedQuerySelector = (function() {
			
			/*
			IE не поддерживает scope: в querySelector, поэтому требуется альтернативное решение.
			Решение найдено здесь: https://github.com/lazd/scopedQuerySelectorShim
			*/
			
			(function() {
			  if (!HTMLElement.prototype.querySelectorAll) {
			    throw new Error('rootedQuerySelectorAll: This polyfill can only be used with browsers that support querySelectorAll');
			  }

			  // A temporary element to query against for elements not currently in the DOM
			  // We'll also use this element to test for :scope support
			  var container = document.createElement('div');

			  // Check if the browser supports :scope
			  try {
			    // Browser supports :scope, do nothing
			    container.querySelectorAll(':scope *');
			  }
			  catch (e) {
			  	
			    // Match usage of scope
			    var scopeRE = /^\s*:scope/gi;

			    // Overrides
			    var overrideNodeMethod = function(prototype, methodName) {

			      // Store the old method for use later
			      var oldMethod = prototype[methodName];

			      // Override the method
			      prototype[methodName] = function(query) {
			      	'use strict';
			        var nodeList,
			            gaveId = false,
			            gaveContainer = false,
			            parentNode;

			        if (query.match(scopeRE)) {

			          // Remove :scope
			          query = query.replace(scopeRE, '');

			          if (!this.parentNode) {
			            // Add to temporary container
			            container.appendChild(this);
			            gaveContainer = true;
			          }

			          parentNode = this.parentNode;

			          if (!this.id) {
			            // Give temporary ID
			            this.id = 'rootedQuerySelector_id_'+(new Date()).getTime();
			            gaveId = true;
			          }

			          // Find elements against parent node
			          nodeList = oldMethod.call(parentNode, '#'+this.id+' '+query);

			          // Reset the ID
			          if (gaveId) {
			            this.id = '';
			          }

			          // Remove from temporary container
			          if (gaveContainer) {
			            container.removeChild(this);
			          }

			          return nodeList;
			        }
			        else {
			          // No immediate child selector used
			          return oldMethod.call(this, query);
			        }
			      };
			    }

			    // Browser doesn't support :scope, add polyfill
			    overrideNodeMethod(HTMLElement.prototype, 'querySelector');
			    overrideNodeMethod(HTMLElement.prototype, 'querySelectorAll');
			  }
			}());

			var extendedQS = function(query, root) {
				var prefix;
				(root) ? (prefix=':scope ') : (prefix=''); 
				var root = root||document;

				switch(typeof query) {
					case 'string':
						

						if (query.indexOf('[')>-1 && argsExpr.exec(query)) {
							/*
							Значения в запросах по поиск аттрибутов необходимо возводить в ковычки
							*/
							var patch = true;
							query = query.replace(argsExpr, "[$1=\"$2\"]"); 
						} 

						if (queryExpr.exec(query) === null) {
							if (query.length===0) return new Array();
							
							// Нативный селектор
							try {
								
								return root.querySelectorAll(prefix+query);
							} catch(e) {
								/*
								Тестируем псевдо-селекторы
								*/
								regPseudoClasssDt.lastIndex = 0;
								if (regPseudoClasssDt.test(query)==true) {
									var ps = query.match(regPseudoClasssDt)[0];
									/*
									Перезапускаем запрос уже без псевдо-селектора
									*/
									return pseusoSelect(extendedQS(query.replace(regPseudoClasssDt, ''), root), ps);
								} else {
									console.log(e);
									throw 'querySelectorAll not support query: '+query;
								}
							}
										
						} else {
							return [document.createElement(result[1].toUpperCase())];
						};
					break;
					case 'function':
						return [];
					break;
					case 'object':
						
						if (query instanceof Array) {
							
							return query;
						} if (query===null) {
							return [];
						} else {
							// test for window
							if (query==window) {
								return [query];
							} else {
								
								return [query];
							};
						}
					break;
					case "undefined":
					default:
						return [query];
					break;
				};
			}

			return extendedQS;
		})(),
		regPlaceholder = /\{\{[^\ }]+\}\}/gi;

		return function(htmlElement) {
			/*
			Search for all placeholders
			*/
			var template = this,
			matches = template.match(regPlaceholder),
			replacings = {};
			matches.forEach(function(dph) {
				var placeholder = dph.substring(2, dph.length-2);
				if ("undefined"!==typeof replacings[placeholder]) return true;
				replacings[placeholder] = '';

				var elements = extendedQuerySelector(placeholder, htmlElement);
				if (elements) replacings[placeholder] = elements[0].innerHTML;
			});
			each(replacings, function(content, ph) {
				template = template.replace('{{'+ph+'}}', content);
			});
			htmlElement.innerHTML = template;
			return template;
		}
});