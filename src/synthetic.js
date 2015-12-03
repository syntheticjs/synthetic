/*
AMD Synthet
*/
(function(name, depends, factory) {
    if (define && "function"===typeof define) define(name, depends, factory);
    
})
("synthet", [
    "abstudio~inherit@0.1.4",
    "abstudio~mixin@0.1.0",
    "./classEvents.js",
    './templateManager.js',
    "polyvitamins~polychrome@master/gist/convert/camelize.js",
    "./smartCallback.js",
    "./preFactory.js",
    "./initAngular.js",
    "./scopeGenerator.js",
    "./webElementFactory.js",
    "polyvitamins~polyinherit@master",
    "./d3party/WebReflection/document-register-element.amd.js"
], function(
    inherit, 
    mixin, 
    eventsClass, 
    templateManager,
    camelize, 
    smartCallback, 
    ComponentPreFactory, 
    initAngular,
    scopeGenerator,
    WebElementFactory
) { 

        

        function getRandomColor() {
            var letters = '0123456789ABCDEF'.split('');
            var color = '#';
            for (var i = 0; i < 6; i++ ) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        }
        /*
        Функция направлена на полное дублирование proto в target без
        связей
        */
        var startextend = function(target, proto) {
            for (var prop in proto) {
                if (proto.hasOwnProperty(prop)) {
                    if ("object"===typeof proto[prop]) {
                        target[prop] = proto[prop] instanceof Array ? [] : {};
                        startextend(target[prop], proto[prop]);
                    } else {
                        target[prop] = proto[prop];
                    }
                }
            }
        }
        var componentAttacher = function() {
            /*
            Если элемент добавлен в дерево 
            */
            //if (this.synthetic.__config__.$$angularInitialedStage>2) {
                //console.log("%cpostAttached", "font-weight:bold;", this);
            //}

            // Search parent synthetic element
            if (!this.synthetic.__config__.permanent) {
                /*
                Только если отключена опция permanent мы меняем информацию о старшем компоненте
                В режиме permanent объект должен всегда находится в изначальном состоянии,
                даже если был был перемещен
                */
                var pe = this.synthetic.$element.parentNode;

                while (!(pe === null || "undefined" !== typeof pe.synthetic)) {
                    pe = pe.parentNode
                }

                /*
                Удаляем себя из предыдущего $parent
                */
                if (this.synthetic.$parent) {
                    this.synthetic.$parent.$$unRegisterChild(this.synthetic);
                }

                this.synthetic.$parent = (pe !== null && "object" === typeof pe.synthetic) ? pe.synthetic : false;


                /*
                Регистрируем себя в parentComponent
                */
                if (this.synthetic.$parent) {
                    this.synthetic.$parent.$$registerChild(this.synthetic);
                    this.synthetic.trigger('parentDefined');
                }

            }

            // Fires event
            this.synthetic.trigger("attached", [ this.synthetic ]);
            this.synthetic.__config__.attachedEventFires = true;
        }
        var componentCreater = function(componentFactory) {
            /*
            Отклоняем, если по какой то причине этот компонент уже инициализирован.
            Так же по непонятным причинам компонент дублируется из размещения в DOM,
            в этом случае мы так же должны его игнорировать.
            TODO: выяснить причину дублирования
            */

            if (this.synthetic) return false;
           
            
            // inherit constructors
            for (var i = 0;i<componentFactory.constructors.length;++i) {
                WebElementFactory.inherit(componentFactory.constructors[i]);
            }
           
            var WebElement = new WebElementFactory(this, componentFactory);
        };

        var regScriptContent = /<script[^>]*>([.\w\d\r\t\n\.\s;'"{}\(\)]*)<\/script>/i,
        regSyntheticScript = /^[\t\r\s]*Synthetic\(/i;
        var Synthetic = function(element) {
            if ("object"===typeof element.synthetic) {
                return element.synthetic;
            } else if ("function"===typeof element) {
                if (Synthetic.$$lastElementFactory) {
                    Synthetic.$$lastElementFactory.$queue(function() { this.$inject(element)(); });
                }
                return false;
            }
            return false;
        };

        Synthetic.prototype = {
            construct: Synthetic
        };

        /*
        Находит компонент в состав которого входит данный элемент
        */
        Synthetic.search = function(element) {
            while (element!==null && "object"!==typeof element.synthetic) {
                element = element.parentNode;
            }
            return (element!==null && element.synthetic) ? element.synthetic : false;
        }

        /*
        CHARGE IT BY EVENT EMITTER * * * * *
        Синтетик генерирует глоабальные события, такие как angularResolved
        */
        for (var prop in eventsClass.prototype) {
            if (eventsClass.prototype.hasOwnProperty(prop)&&"function"===typeof eventsClass.prototype[prop]) {
                Synthetic[prop] = eventsClass.prototype[prop];
            }
        }
        eventsClass.call(Synthetic);
        /*
        * * * * * * * * * * * * * * * * * *
        */

        Synthetic.log = function() {
            //console.log.apply(console, (["%cSynthetic:","color:blue;font-style:italic;"]).concat(Array.prototype.slice.apply(arguments)));
        }

        Synthetic.$$angularBootstraped = false;

        /*
        Last factory
        */
        Synthetic.$$lastElementFactory = false;

        Synthetic.hasPropertySubKey = function(property, subkey) {
            if (!("string"===typeof property||property instanceof Array)) return false;
            return !!~("string"===typeof property?property.replace(' ','').split(','):property).indexOf(subkey);
        }

        Synthetic.createComponent = function(componentOptions, constructor) {

            var defaultOptions = {
                name: '',
                engine: 'sinthezia'
            };

            /*
            Преобразуем строковое представление componentOptions в объект
            */
            componentOptions = "string"!==typeof componentOptions ?
            mixin(defaultOptions, componentOptions) : mixin(defaultOptions, {
                name: componentOptions
            });

            /*
            Преобразуем строкове представление engine в объект
            */
            if ("string"===typeof componentOptions.engine) {
                componentOptions.engine = {
                    name: componentOptions.engine,
                    initial: false
                }
            } else if ("object"===typeof componentOptions.engine&&componentOptions.engine instanceof Array) {
                componentOptions.engine = {
                    name: componentOptions.engine[0],
                    initial: componentOptions.engine[1]||false
                }
            }

            if (componentOptions.name.indexOf("-") < 0) throw "Module name must have `-` symbol";

            var componentFactory = new ComponentPreFactory(componentOptions),
            prototype = smartCallback.call({
                $component: componentFactory
            }, constructor)();

            if ("object"===typeof prototype) {
                componentFactory.proto(prototype);
            } else if ("function"===typeof prototype) {
                componentFactory.construct(prototype);
            }

            // Normalize scope
            componentOptions.scope = "object"===typeof componentOptions.scope ? componentOptions.scope : {};

            /*
            Если мы используем angular, то помимо копонента мы создаем минимальную директиву,
            задача которой будет создавать изолированный scope для каждого компонента
            */
            if (componentOptions.engine.name==='angular') {
                /* Creates angular app if not exists. Why i'm speaking english??? */
                if ("undefined"===typeof Synthetic.$$angularApp) {
                    initAngular();
                }
                
                if ("function"===typeof componentFactory.options.engine.initial) {
                    componentFactory.options.engine.initial(Synthetic.$$angularApp);
                }

                var rcolor = getRandomColor();
                Synthetic.$$angularApp.directive(camelize(componentOptions.name), function() {
                    return {
                        restrict: 'E',
                        priority: 998,
                        scope: true,
                        controller: function($element) {

                        },
                        compile: function($element, $rscope, $a, $controllersBoundTransclude) {

                            if (Synthetic($element[0]))
                            Synthetic($element[0]).__config__.$$angularDirectived = true;
                            else {
                                
                                /* Если директива отработала быстрей через компонент, то мы производим незамедлительную инициализацию */
                                componentCreater.call($element[0], componentFactory);
                            }

                            
                            return {
                                pre: function($scope, $element) {
                                    if (!Synthetic($element[0])) return;
                                    Synthetic($element[0]).__config__.$$angularDirectived = true;
                                    /*
                                    В данной ситуации пришлось отказаться от использования extend для
                                    создания дефолтного значения scope на основе предустановок;
                                    Странно, но даже при использовании extend, который является близкой копией extend
                                    из jQuery, некоторые свойства источника передаются по ссылке, а не копируются, что 
                                    приводит к катастрофическим ошибкам, связанным с записью данных в источник.

                                    Функция startextend гарантирует, что все копируемые свойства будут перевоссозданы заново,
                                    однако эта функция не осуствляет миксим с существующими значениями $scope, поэтому ее можно
                                    использовать только при первичной инициализации.

                                    Желательно выяснить по какой причине extend не создает требуемых копий свойств.
                                    */
                                    startextend($scope, componentOptions.scope);

                                    
                                    /*
                                    Если scope для элемента не установлен, то вероятно этот элемент используется в ngRepeat и временно
                                    пермещен в documentFragment. Такой элемент не нужно инициализировать.

                                    !!! Однако если мы размещаем диерктивы по приоритету ниже чем ng-repeat, то pre не вызывается в принципе.
                                    TODO: решить это
                                    */
                                    /*if (angular.element($element[0]).scope()===undefined) {
                                        console.log("%c<custom-directive>", "color:blue;font-weight:bold;", 'destroy', $element, $scope);
                                        Synthetic($element[0]).$destroy();
                                        return;
                                    }*/


                                    Synthetic($element[0]).__config__.$$angularDirectived = true;
                                    scopeGenerator($element[0].synthetic, $scope);

                                    return function(scope) {
                                        //console.log('prePost', scope);
                                    }
                                   
                                },
                                post: function($scope, $element) {
                                    if (!Synthetic($element[0])) return;
                                    // 3 этап инициализации angular означает, что объект полностью
                                    // инициализирован
                                    Synthetic($element[0]).__config__.$$angularInitialedStage = 3;
                                }
                            }
                            
                            /**/
                        }
                    }
                });
            }

            document.registerElement(componentOptions.name, {
                prototype: Object.create(HTMLElement.prototype, {
                    createdCallback: {
                        value: function() {
                            componentCreater.call(this, componentFactory);
                        }
                    },
                    attachedCallback: {
                        value: function() {
                            
                            if (this.synthetic.__config__.allWaitingForResolve==='attached')
                                this.synthetic.__config__.allWaitingForResolve = false;
                            componentAttacher.call(this);                           
                        }
                    },
                    detachedCallback: {
                        value: function() {
                            if (this.synthetic.$destroyed) return false;
                            this.synthetic.__config__.allWaitingForResolve = 'attached';
                            this.synthetic.__config__.attachedEventFires = false;
                            this.synthetic.trigger("detached", [ this.synthetic ]);
                        }
                    },
                    attributeChangedCallback: {
                        configurable: true,
                        writable: true,
                        enumerable: true,
                        value: function(name, previousValue, value) {

                            var camelized = camelize(name);
                            /*
                            Для разгрузки производительности мы просматриваем лишь те аттрибуты, за которыми 
                            мы наблюдаем
                            */

                            if (this.synthetic.$$attrsWatchers[camelized]) {

                                /*
                                Останавливаем отслеживание аттрибутов, если компонент удален или в процессе 
                                удаления
                                */
                                if (this.synthetic.destoryed) return false;
                                /*
                                В случае если компонент работает через angular, запись будет производит в $$angularScope
                                */
                                if (Synthetic.$$angularApp && this.synthetic.__config__.$$angularInitialedStage>1) {
                                    if (previousValue !== value) {
                                            // Использование Apply portion позволяет
                                            // применить комбо изменений в scope 
                                            var $self = this.synthetic;
                                            // Присваиваем значение аттрибутов сейчас, но apply вызываем
                                            // позже. Это снизит нагрузку
                                            $self.$digest(function() {
                                                
                                                $self.$injectors.$scope.attributes[camelized] = value;
                                                
                                                if (name.substr(0,5)==='data-') {
                                                        $self.$injectors.$scope.properties[camelize(name.substr(5))] = value;
                                                }

                                                if (value==='') value = false;

                                                if ($self.$$attrsWatchers[camelized]) {
                                                    if ($self.__config__.attachedEventFires) {
                                                        
                                                        for (var i = 0;i<$self.$$attrsWatchers[camelized].length;++i) {
                                                                

                                                                $self.$$attrsWatchers[camelized][i].call($self, false, 'set', value);
                                                           
                                                        }
                                                    }
                                                }
                                            });                                                               
                                    }
                                } else {
                                    if (previousValue !== value) {
                                        this.synthetic.$injectors.$scope.attributes[camelize(name)] = value;
                                        if (name.substr(0,5)==='data-') {
                                           
                                                this.synthetic.$injectors.$scope.properties[camelize(name.substr(5))] = value;
                                           
                                        }
                                    }
                                }
                            }
                        }
                    }
                })
            });
           

            

            return componentFactory;
        }

        if (window) window.Synthetic = Synthetic;
        return Synthetic;
});