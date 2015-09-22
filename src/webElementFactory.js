define([
    "./WebElementPrototype.js",
    "abstudio~mixin@0.1.0",
    "./generator.js",
    "polyvitamins~polychrome@master/gist/convert/camelize.js",
    "./getNonScopeValue.js",
    "polyvitamins~polyinherit@master",
], function(WebElementPrototype, mixin, Generator, camelize, getNonScopeValue) {
    /*
    Как только элемент попадает в DOM он проходит данную инициализацию.
    Если работа ведется с angular то этот код должен быть выполнен до
    того как angular применит compile для этой директивы.

    Когда angular начнет выполнение compile мы должны быть готовы
    предоставить ей всю необходимую информацию, желательно template и
    модуль.
    */
    return function(element, component) {
            /*
            Устанавливаем отладочную идентификацию
            */
            this.randomId = Math.round(Math.random()*10000000);

            /*
            Если в качестве движка выбран angular мы должны добавить аттрибут-директиру, которая уже описана при регистрации компонента
            */
            if (component.options.engine.name==='angular') {
                element.setAttribute(component.options.name, "exp");
                element.setAttribute("rid", this.randomId);
                this.$$attrsWatchers = {}; // Дополнительный ресурс для watchers, ускоряющий работу за отслеживанием аттрибутов
            }
            
            /*
            Указываем последнюю factory для элемента
            */
            Synthetic.$$lastElementFactory = this;

            /*
            Устанавливаем пямять для запросов к данным scope
            */
            this.$scopeSnaps = {};
            
            /*
            Привязываем элемент к его контроллеру
            */
            this.$element = element;

            /*
            Привязываем образ компонента
            */
            this.component = component;

            /*
            Привязываем контроллер к его элементу
            */
            Object.defineProperty(element, 'synthetic', {
                enumerable: false,
                writable: false,
                configurable: false,
                value: this
            });

            /*
            Создаем основное системное конфигурационное свойство
            */
            Object.defineProperty(this, '__config__', {
                enumerable: false,
                writable: false,
                configurable: true,
                value: mixin({
                    allWaitingForResolve: false, // Используется при инициализации angular.
                    // DOTO: delete depricated element
                    generator: false, // Depricated
                    $$angularInitialedStage: 0, // Этап инициализации angular
                    $$angularDirectived: false, // Поддерживает ли этот элемент директива angular
                    createdEventFires: false, // Произошло ли событие created
                    attachedEventFires: false, // Произошло ли событие attached
                    templateModulePrototype: false // Класс, которым автоматичнески расширяется модуль шаблона 
                }, component.options)
            });

            /*
            Создаем базовый scope
            */
            this.$$scope = {
                attributes: {}, // Содержит все аттрибуты элемента
                properties: {}, // Содержит все аттрибуты data-*
                html: {},
                uid: 'syntheticElement'+Math.round(Math.random()*10000)
            };

            /*
            Создаем доступное свойство scope, которое назависимо от используемого движка
            вернет текущий scope
            */
            Object.defineProperty(this, '$scope', {
                enumberable: true,
                get: function() {
                    return this.$injectors.$scope;
                }.bind(this)
            });

            /*
            Создаем коллекцию инжекторовы
            */
            Object.defineProperty(this, '$injectors', {
                enumerable: false,
                writable: false,
                configurable: true,
                value: {
                    $scope: this.$$scope,
                    $element: element,
                    $self: this,
                    $component: component,
                    $generator: new Generator(this)
                }
            });

            /*
            Комплекс действий по инициализации angular, произойдет это только в том случае если в опциях
            компонента указано, что он должен использовать angular
            */            
            if ("object"===typeof angular&&angular.bootstrap&&component.options.engine.name==='angular') {
                var $self = this;
                
                this.$$angularControllerName = 'singular'+(new Date()).getTime()+Math.round(Math.random()*10000);
                /*
                Нам наобходимо отслеживать этапы инициализации директивы, покрайней мере на этапе форматирования
                схемы функционирования интеграции с angular
                */
                this.__config__.$$angularInitialedStage = 1;
                /*
                Устанавливаем для директивы событие, которое компонент будет ожидать прежде чем продолжить инициализацию.
                Когда событие angularResolved сработает в scope будут импортированы свойсвта системного scope, а так же
                будут перенесены системные watchers в angular.
                */
                this.__config__.allWaitingForResolve = 'angularResolved';

                /*
                Ручная инициализация первого компонента.

                Поскольку наш angular инициализируется не сразу, корневой контроллер может не инициализироваться
                самостоятельно, поэтому нам следует его инициализировать форсировано.

                TODO: Следует внимательно рассмотреть необходимость этой меры, перед созданием beta-релиза.
                */                
                if (Synthetic.$$angularBootstraped) Synthetic.$$angularTimeout(function() {
                    
                    // Deprecated
                    if (!$self.__config__.$$angularDirectived&&$self.__config__.$$angularInitialedStage<2) {
                        
                        Synthetic.$$angularCompile($self.$element)(angular.element($self.$element).scope());
                    }
                });
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
                Remove loading class
                */
                /*var i =this.$element.className.split(' ').indexOf('synt-loading')
                if (!!~i) {
                    var st = this.$element.className.split(' ');
                    st.splice(i,1);
                    this.$element.className = st.join(' ');
                }*/
                if (!~this.$element.className.split(' ').indexOf('synt-loaded'))
                this.$element.className+=' synt-loaded';

                /*
                Культивируем аттрибуты
                */
                for (var z = 0; z < element.attributes.length; z++) {
                    var value = getNonScopeValue(element.attributes[z].value);
                    this.$injectors.$scope.attributes[camelize(element.attributes[z].name)] = value;
                    if (element.attributes[z].name.substr(0,5)==='data-') {
                        
                        this.$injectors.$scope.properties[camelize(element.attributes[z].name.substr(5))] = value;
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

                /*
                После того как wathers назначены, необходимо немедленно проверить их значение
                */
                for (var i = 0;i<component.watchers.length;++i) {
                    this.read.apply(this, component.watchers[i]);
                }

            });

        }.inherit(WebElementPrototype);
});