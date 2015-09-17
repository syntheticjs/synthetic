define([
	"./WebElementPrototype.js",
	"abstudio~mixin@0.1.0",
	"./generator.js",
	"./scopeGenerator.js",
	"polyvitamins~polychrome@master/gist/convert/camelize.js",
	"polyvitamins~polyinherit@master",
], function(WebElementPrototype, mixin, Generator, scopeGenerator, camelize) {
	return function(element, component) {
            this.randomId = Math.round(Math.random()*10000000);
            sx.debug('create-comp'+this.randomId).evaluate('@begin');
            if (component.options.engine.name==='angular') {
                element.setAttribute(component.options.name, "exp");
            }

            Synthetic.$$lastElementFactory = this;

            this.$element = element;

            Object.defineProperty(element, 'synthetic', {
                enumerable: false,
                writable: false,
                configurable: false,
                value: this
            });

            Object.defineProperty(this, '__config__', {
                enumerable: false,
                writable: false,
                configurable: true,
                value: mixin({
                    allWaitingForResolve: false, // Используется при инициализации angular.
                    // DOTO: delete depricated element
                    generator: false, // Depricated
                    $$angularInitialedStage: 0, // Этап инициализации angular
                    createdEventFires: false, // Произошло ли событие created
                    attachedEventFires: false, // Произошло ли событие attached
                    templateModulePrototype: false // Класс, которым автоматичнески расширяется модуль шаблона 
                }, component.options)
            });

            var $$scope= {
                attributes: {}, // Содержит все аттрибуты элемента
                properties: {}, // Содержит все аттрибуты data-*
                html: {},
                uid: 'syntheticElement'+Math.round(Math.random()*10000)
            };

            Object.defineProperty(this, '$scope', {
                enumberable: true,
                get: function() {
                    return this.$injectors.$scope;
                }.bind(this)
            });

            Object.defineProperty(this, '$injectors', {
                enumerable: false,
                writable: false,
                configurable: true,
                value: {
                    $scope: $$scope,
                    $element: element,
                    $self: this,
                    $component: component,
                    $generator: new Generator(this)
                }
            });
            /*
            Если обнаружен angular, то мы создаем новое приложение для него
            и размещаем контроллер на компоненте.
            Имя приложения и контроллера создаются рандомно. Для каждого
            нового экземпляра компонента создается свой экземпляр
            приложения angular.
            Имя приложения >> this.$$angularModuleName
            Имя контроллера >> this.$$angularModuleName+'Controller'

            Когда происходит инициализация экземпляр получается состояние
            __config__.$$angularInitialedStage = 1 и 
            __config__.allWaitingForResolve = 'angularResolved';

            При этом все слушатели событий будут задержаны до 
            инициализации $scope от angular, а произойдет это при 
            attached.
            Когда инициализация $scope от angular произойдет состояние
            __config__.$$angularInitialedStage станет 2 и будет вызвано
            событие 'angularResolved', все watchers пройдут инициализацию
            */
            sx.debug('create-comp'+this.randomId).evaluate('init');
            if ("object"===typeof angular&&angular.bootstrap&&component.options.engine.name==='angular') {
                var $self = this;
                
                this.$$angularControllerName = 'singular'+(new Date()).getTime()+Math.round(Math.random()*10000);
                 /*
                Set element angular integration stage
                */
                this.__config__.$$angularInitialedStage = 1;
                /*
                Set element waiting for `angularResolved` 
                */
                this.__config__.allWaitingForResolve = 'angularResolved';
                

                if (Synthetic.$$angularBootstraped) {
                    setTimeout(function() {
                        sx.debug('create-comp'+$self.randomId).evaluate('apply');
                        scopeGenerator($self, $$scope);
                    },0);
                        
                } else {
                    Synthetic.bind('angularBootstraped', function() {
                        sx.debug('create-comp'+$self.randomId).evaluate('bootstrp');
                    	scopeGenerator($self, $$scope);
                    });
                }
            }

            /*
            Собираем дерево элементов в $scope
            */
           
            for (var i = 0;i<element.childNodes.length;++i) {
                if (element.childNodes[i].nodeType===1) {

                    if (element.childNodes[i].tagName.toLowerCase()==='script'&&regSyntheticScript.test(element.childNodes[i].innerHTML)) {
                       ;(function(content) {
                           var userfunc,
                           Synthetic = function(callback) {
                                userfunc = callback;
                           }
                           try {
                                eval(content);
                           } catch(e) {
                                console.error('Syntehtic: user func corrupt;', content, e);
                                return;
                           }

                           this.$queue(this.$inject(userfunc));
                       }).call(this, element.childNodes[i].innerHTML);
                    } else {
                        this.$injectors.$scope.html[camelize(element.childNodes[i].tagName.toLowerCase())] = element.childNodes[i].innerHTML;
                    }
                }
            }
            

            
            this.$queue(function() {

                /*
                 Культивируем аттрибуты
                 */
                for (var z = 0; z < element.attributes.length; z++) {
                    this.$injectors.$scope.attributes[camelize(element.attributes[z].name)] = element.attributes[z].value;
                    if (element.attributes[z].name.substr(0,5)==='data-') {
                        
                        this.$injectors.$scope.properties[camelize(element.attributes[z].name.substr(5))] = element.attributes[z].value;
                    }
                }

                /*
                Преобраузем пользователський прототип c внедрением селфи аргументов
                */
                for (var i = 0;i<component.prototypes.length;++i) {
                    for (var p in component.prototypes[i]) {
                        if (component.prototypes[i].hasOwnProperty(p)) {
                            this[p] = this.$inject(component.prototypes[i][p]);
                        }
                    }
                }

                
                
                this.trigger("created", [ this.element ]);
                this.__config__.createdEventFires = true;

                /*
                Component conceived methods
                */
                for (var i = 0;i<component.conceivedCallers.length;++i) {
                    this[component.conceivedCallers[i][0]].apply(this, component.conceivedCallers[i][1]);
                }

                /*
                Поочередно вызываем функции для события created (если created уже был)
                */
                if (this.__config__.createdEventFires) {
                    
                    
                    for (var i = 0;i<component.onCreatedCallbacks.length;++i) {
                        
                        this.$inject(component.onCreatedCallbacks[i])();
                    }
                } else {

                    for (var i = 0;i<component.onCreatedCallbacks.length;++i) {

                        this.on("created", component.onCreatedCallbacks[i]);
                    }
                }

                /*
                Поочередно вызываем функции для события attached (если attached уже был)
                */
                if (this.__config__.attachedEventFires) {
                    for (var i = 0;i<component.onAttachedCallbacks.length;++i) {
                        this.$inject(component.onAttachedCallbacks[i])();
                    }
                } else {
                    for (var i = 0;i<component.onAttachedCallbacks.length;++i) {
                        this.on("attached", component.onAttachedCallbacks[i]);
                    }
                }
                
                /*
                Переносим callback для detached
                */
                for (var i = 0;i<component.onDetachedCallbacks.length;++i) {
                    this.on("detached", component.onDetachedCallbacks[i]);
                }

                /*
                Переносим callback для detached
                */
                for (var i = 0;i<component.onAttributeChangedCallbacks.length;++i) {
                    this.on("attributeChanged", component.onAttributeChangedCallbacks[i]);
                }

                /*
                Переносим наблюдение за scope
                */    

                for (var i = 0;i<component.watchers.length;++i) {
                    this.watch.apply(this, component.watchers[i]);
                }


            });

        }.inherit(WebElementPrototype);
});