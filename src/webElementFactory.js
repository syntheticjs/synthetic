
    var WebElementPrototype = require("./WebElementPrototype.js");
    var mixin = require("mixin");
    var extend = require("extend");
    var Generator = require("./generator.js");
    var camelize = require("camelize");
    var getNonScopeValue = require("./getNonScopeValue.js");
    require("polyinherit");

    var presetImport = {};

    /*
    Процедура импорта методов прототипа
    */
    presetImport['presetImportPrototype'] = function(prototype) {
        for (var p in prototype) {
            if (prototype.hasOwnProperty(p)) {
                this[p] = this.$inject(prototype[p]);
            }
        }
    };

    /*
    Процедура импорта опции сохранения родного innerHtml
    */
    presetImport['presetImportDefaults'] = function(defaultHtml, config) {
        var self = this;
        switch (defaultHtml) {
            case "preserve": // Сохранить в documentFragment
                self.$injectors.$defaultHtml = document.createDocumentFragment();

                for (var i = 0; i < self.element.childNodes.length; ++i) {
                    /*
                    При клонировании элемента обязательно нужно указывать параметр deep (протестировано на sag)
                    */
                    if (self.element.childNodes[i].nodeType === 1 || self.element.childNodes[i].nodeType === 3) {
                        self.$injectors.$defaultHtml.appendChild(self.element.childNodes[i].cloneNode(true));
                    }
                }

            break;
            case "clear": // Очистить и забыть
                self.element.innerHTML = "";
            break;
        }

        mixin(self.$$scope.$config, config);
    }

    /*
    Коллекция метода импорта значений из preset
    */
    presetImport['presetImportWatchers'] = function(watchers) {
        /*
        Переносим наблюдение за scope
        */
        for (var i = 0;i<watchers.length;++i) {
            this.$watch.apply(this, watchers[i]);
        }
    };

    /*
    Процедура импорта callback-функций из presets
    */
    presetImport['presetImportCallbacksAction'] = function(conceivedCallers, template, onCreate, onAttach, onDetach, observeAttrs) {
        var self = this;
        /*
        Component conceived methods
        */
        for (var i = 0;i<conceivedCallers.length;++i) {
            self[conceivedCallers[i][0]].apply(self, conceivedCallers[i][1]);
        }

        /*
        Устанавливаем шаблон по умолчанию, если он указан
        */
        if (template) {
            self.$template.apply(self, template);
        }

        /*
        Поочередно вызываем функции для события created (если created уже был)
        */
        if (self.__config__.createdEventFires) {
            for (var i = 0;i<onCreate.length;++i) {
                self.$inject(onCreate[i])();
            }
        } else {
            for (var i = 0;i<onCreate.length;++i) {
                self.on("created", onCreate[i]);
            }
        }

        /*
        Поочередно вызываем функции для события attached (если attached уже был)
        */
        if (self.__config__.attachedEventFires) {
            for (var i = 0;i<onAttach.length;++i) {
                self.$inject(onAttach[i])();
            }
        } else {
            for (var i = 0;i<onAttach.length;++i) {
                self.on("attached", onAttach[i]);
            }
        }

        /*
        Переносим callback для detached
        */
        for (var i = 0;i<onDetach.length;++i) {
            self.on("detached", onDetach[i]);
        }

        /*
        Переносим callback для attributeChanged
        */
        for (var i = 0;i<observeAttrs.length;++i) {
            self.on("attributeChanged", observeAttrs[i]);
        }
    };

    /*
     Как только элемент попадает в DOM он проходит данную инициализацию.
     Если работа ведется с angular то этот код должен быть выполнен до
     того как angular применит compile для этой директивы.

     Когда angular начнет выполнение compile мы должны быть готовы
     предоставить ей всю необходимую информацию, желательно template и
     модуль.
     */
    module.exports = function(element, component) {
        var self = this;
        /*
        Указываем последнюю factory для элемента. Она используется при внедлении скрипта через тэг <script>
        внутри компонента
        */
        Synthetic.$$lastElementFactory = this;

        /*
        Set element synthetic identifier named as $sid.
        $sid is a unique name of syntehtic element.
        */
        this.$sid = 'sid'+(new Date()).getTime()+Math.round(Math.random()*10000000);

        /*
        Add sid to element attributes
        */
        element.setAttribute("sid", this.$sid);

        /*
        Capture cross event `destroy` of parent element and destroy this element 
        */
        this.capture('destroy', function() {
            this.$destroy();
        });

        /*
        Дополнительный ресурс для watchers, ускоряющий работу за отслеживанием аттрибутов
        */
        this.$$attrsWatchers = {};

        /*
        Устанавливаем ссылку на родительский компонент по умолчанию
        */
        this.$parent = false;

        /*
        Устанавливаем ссылки на дочерние компоненты по умолчанию
        */
        this.$childs = {};

        /*
        Устанавливаем пямять для запросов к данным scope.
        Используется для кеширования тех запросов, что уже были созданы и позволяет
        отсеивать дублирубщие запросы.
        */
        this.$scopeSnaps = {};

        /*
        Привязываем элемент к его контроллеру
        */
        this.$element = element;

        /*
        Привязываем образ компонента к самому себе
        */
        this.component = component;


        /*
        Привязываем контроллер к его элементу
        Достигаем обратного связывания
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
                allWaitingForResolve: false, // Используется при инициализации angular
                $$angularInitialedStage: 0, // Этап инициализации angular
                $$angularDirectived: false, // Поддерживает ли этот элемент директива angular
                createdEventFires: false, // Произошло ли событие created
                attachedEventFires: false, // Произошло ли событие attached
                templateModulePrototype: false, // Класс, которым автоматичнески расширяется модуль шаблона
                rendered: false // Произведен ли рендеринг элемента TODO: проверить факт юзабельности
            })
        });

        /*
        Создаем базовый scope
        */
        this.$$scope = {
            attributes: {}, // Содержит все аттрибуты элемента
            properties: {}, // Содержит все аттрибуты data-*
            $config: {},
            $shadowTemplate: null,
            uid: 'syntheticElement'+Math.round(Math.random()*10000)
        };

        /*
        Создаем доступное свойство scope, которое назависимо от используемого движка
         вернет текущий scope
        */
       
        Object.defineProperty(this, '$scope', {
            enumberable: true,
            get: function() {
                return self.$injectors.$scope;
            }
        });

        /*
         Создаем коллекцию инжекторовы
         */
        Object.defineProperty(this, '$injectors', {
            enumerable: false,
            writable: false,
            configurable: true,
            value: [
                {
                    $scope: this.$$scope,
                    $element: element,
                    $self: this,
                    $component: component,
                    $generator: null, // Инициализируем генератор
                    $stock: {},
                    $config: function(properties, callback) {
                        self.$fetch('$config', properties, callback);
                    },
                    $setup: function(data) {
                        self.$employ(function() {
                            extend(self.$scope.$config, data);
                        });
                    }
                }
            ]
        });

        this.$injectors.$generator = new Generator(this);

        /*
        Комплекс действий по инициализации angular, произойдет это только в том случае если в опциях
        компонента указано, что он должен использовать angular
        */
        if ("object"===typeof angular&&angular.bootstrap&&component.engine.name==='angular') {
            var $self = this;

            // TODO: Depricate
            // this.$$angularControllerName = 'singular'+(new Date()).getTime()+Math.round(Math.random()*10000);

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

                if ($self.$destroyed) return;

                if (!$self.__config__.$$angularDirectived&&$self.__config__.$$angularInitialedStage<2) {

                    try {
                        Synthetic.$$angularCompile($self.$element)(angular.element($self.$element).scope());
                    } catch(e) {
                        try {
                            /*
                            Если мы попали сюда, то вероятно объект был создан в корне дерева, нам нужно создать
                            для него scope самостоятельно
                            */
                            Synthetic.$$angularCompile($self.$element)(Synthetic.$$angularRootScope.$new());
                        } catch(e) {
                            console.error('Angular fatal error. Scope is not created.', e, $self.$element);
                        }
                    }
                }

            });
        }

        /*
        Собираем дерево элементов в $scope
        */
        for (var i = 0;i<element.childNodes.length;++i) {
            if (element.childNodes[i].nodeType===1) {
                /*
                 DEPRICATED: пока что этот функционал не используется и не протестирован
                 */
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

                    //this.$injectors.$scope.html[camelize(element.childNodes[i].tagName.toLowerCase())] = element.childNodes[i].innerHTML;
                }
            } else if (element.childNodes[i].nodeType===8) {
                /*
                 Анализируем контент тэга по предмет поиска коммент-data.
                 */
                var nv = element.childNodes[i].nodeValue.trim();

                if (nv.substr(0,9)==='template:') {
                    this.$$scope.$shadowTemplate = nv.substr(9);
                }
            }
        }

        /*
        Пришло время работать с preset
        */
        var presets = ['@'],
        userPreset = element.getAttribute('preset');

        if (userPreset!==null&&userPreset.charAt(0)!=='{') {
            presets.push(userPreset);
        }

        /*
        Отмечаем выделенные preset как отработанные
        */
        for (var i = 0;i<presets.length;++i) {
            component.presets[presets[i]].performed = true;
        }

        /*
        Начинаем наблюдение за переменной preset
        */
        var watchPresetValue = function() {
            self.$watch('attributes.preset', function(preset) {
                if (!component.presets[preset].performed) {
                    for (var prop in presetImport) {
                        if (presetImport.hasOwnProperty(prop))
                        component.$usePreset(presets, presetImport[prop], this);
                    }
                }
            });
        };
        if (!this.$parent) {
            this.bind('parentDefined', function() {
                watchPresetValue();
            }, true);
        } else {
            watchPresetValue();
        }
        
        /*
        Анализ опции, указывающей на то как поступить с родным innerHtml элемента
        */
        component.$usePreset(presets, presetImport['presetImportDefaults'], this);

        /*
        Ожидаем инициализации движка
        */
        this.$queue(function() {
            /*
            На данном этапе мы уже должны обязательно подготовить данные о $parent
            */
            var pe = this.$element.parentNode;

            while (!(pe === null || "undefined" !== typeof pe.synthetic)) {
                pe = pe.parentNode;
            }

            this.$parent = (pe !== null && "object" === typeof pe.synthetic) ? pe.synthetic : false;
            /*
            Регистрируем себя в parentComponent
            */
            if (this.$parent) {
                this.$parent.$$registerChild(this);
                this.trigger('parentDefined');
            }

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
            Преобраузем прототип компонента c применем inject
            */
            component.$usePreset(presets, presetImport['presetImportPrototype'], this);

            /*
            Отправляем событие created
            */
            this.trigger("created", [ this.element ]);
            this.__config__.createdEventFires = true;
            
            component.$usePreset(presets, presetImport['presetImportCallbacksAction'], this);


            /*
            Анонимная evalWatchers поможет начать наблюдение за scope в нужный момент
            */
            var evalWatchers = function() {
                component.$usePreset(presets, presetImport['presetImportWatchers'], self);
            }

            /*
            Задерживаем выполнение наблюдателей до момента инициализации нашего местоположения
            */
            if (!this.$parent) {
                this.bind('parentDefined', function() {
                    evalWatchers.call(this);   
                }, true);
            } else {
                evalWatchers.call(this);
            }

            
            this.trigger("rendered", [this.$element]);
            this.__config__.rendered = true;
        });

    }.inherit(WebElementPrototype);