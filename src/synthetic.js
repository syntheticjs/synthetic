var inherit = require('inherit');
var mixin = require('mixin');
var eventsClass = require('./classEvents.js');
var camelize = require('camelize');
var smartCallback = require("./smartCallback.js");
var ComponentPreFactory = require("./preFactory.js");
var initAngular = require("./initAngular.js");
var scopeGenerator = require("./scopeGenerator.js");
var WebElementFactory = require("./webElementFactory.js");
var Creed = require('polypromise').Creed;
var Pending = require('polypromise').Pending;
require("polyinherit");
require("document-register-element");

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
    var self = this;
    /*
    Позволяет скрывать элемент до полной инициализации
    */
    if (this.synthetic.__config__.$$angularInitialedStage>1 && !Synthetic.$$angularBootstraped) {
        
        this.synthetic.$element.style.visibility = 'hidden';
        Synthetic.bind('angularBootstraped', function() {
               self.synthetic.$element.style.visibility = '';
            }, true);
    }

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

        /*
        Делаем повторную инициализацию template, в случае если он уже существует.
        Поскольку angular вместо удаления элементов просто помещает их в documentFragment
        не будут работать дестроеры для модулей. 
        Поэтому дестроеры теперь срабатывают при detach элементов, так же как повторная
        инициализация при attach элементов здесь.
        */
        if (this.synthetic.$generator.configuration.module) {
            this.synthetic.$generator.moduleReinit();
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
    /*
    TODO: Is this really deprecated?
    DEPRECATED
    for (var i = 0;i<componentFactory.constructors.length;++i) {
        WebElementFactory.inherit(componentFactory.constructors[i]);
    }
    */
   
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


Synthetic.components = {};

Synthetic.log = function() {
    //console.log.apply(console, (["%cSynthetic:","color:blue;font-style:italic;"]).concat(Array.prototype.slice.apply(arguments)));
}

Synthetic.$$angularBootstraped = false;

/*
Last factory
*/
Synthetic.$$lastElementFactory = false;

/*
Default config
*/
Synthetic.config = {
    undefinedAttributeDefaultValue: undefined,
    viewChangeListeners: []
};

/*
Pending api
*/
Synthetic.Pending = function(resolver, args) {
    return new Pending(resolver, args);
}

Synthetic.hasPropertySubKey = function(property, subkey) {
    if (!("string"===typeof property||property instanceof Array)) return false;
    return !!~("string"===typeof property?property.replace(' ','').split(','):property).indexOf(subkey);
}

Synthetic.createComponent = function(componentOptions, workshop) {

    var name = '', engine = {
        name: 'synthetic',
        initial: false
    }, scope = false, HTMLElementPrototype = "HTMLElement";

    /*
    Преобразуем строковое представление componentOptions в объект
    */
    if ("string"!==typeof componentOptions) {
        // Import name 
        if (componentOptions.name) name = componentOptions.name;
        // Import engine options
        if ("string"===typeof componentOptions.engine) {
            engine = {
                name: componentOptions.engine,
                initial: false
            }
        } else if ("object"===typeof componentOptions.engine&&componentOptions.engine instanceof Array) {
            engine = {
                name: componentOptions.engine[0],
                initial: componentOptions.engine[1]||false
            }
        }
        // Import default scopr
        if ("object"===typeof componentOptions.scope) {
            scope = componentOptions.scope;
        }
        //
        if ("string"===typeof componentOptions.HTMLElementPrototype)
            HTMLElementPrototype = componentOptions.HTMLElementPrototype;
    } else {
        name = componentOptions;
    }

    /* Validate name */
    if (name.indexOf("-") < 0) throw "Module name must have `-` symbol";
    
    /*
    Create component
    */
    var componentFactory = new ComponentPreFactory({
        name: name, // Component name
        engine: engine // Component engine
    });

    /*
    Create default preset
    */
    var preset = componentFactory.createPreset('@');
    /*
    Import scope
    */
    if (scope) preset.$scope(scope);
    /*
    Import general workshop
    */
    preset.$run(workshop);

    /*
    Если мы используем angular, то помимо копонента мы создаем минимальную директиву,
    задача которой будет создавать изолированный scope для каждого компонента
    */
    if (engine.name==='angular') {
        /* Creates angular app if not exists. Why i'm speaking english??? */
        if ("undefined"===typeof Synthetic.$$angularApp) {
            initAngular();
        }
        
        if ("function"===typeof componentFactory.engine.initial) {
            componentFactory.engine.initial(Synthetic.$$angularApp);
        }

        /*
        Creating angular directive
        */
        Synthetic.$$angularApp.directive(camelize(name), function() {
            return {
                restrict: 'E',
                priority: 998,
                scope: true,
                compile: function($element, $rscope, $a, $controllersBoundTransclude) {

                    // Запоминаем стартовое значение html
                    var $defaultHtml = $element[0].innerHTML;

                    // If element already initialized change angular directived status to true
                    if (Synthetic($element[0])) {
                        Synthetic($element[0]).__config__.$$angularDirectived = true;
                    } else {
                        /*
                        If web-component still unitialized, initialize it by the force
                        */
                        componentCreater.call($element[0], componentFactory);
                    }

                    
                    return {
                        pre: function($scope, $element) {
                            /*
                            Элемент не может быть обработан директивой, если он не синтезирован
                            */
                            if (!Synthetic($element[0])) return;

                            Synthetic($element[0]).__config__.$$angularDirectived = true;
                            /*
                            В данной ситуации пришлось отказаться от использования extend для
                            создания дефолтного значения scope на основе предустановок;
                            Странно, но даже при использовании extend, который является близкой копией extend
                            из jQuery, некоторые свойства источника передаются по ссылке, а не копируются, что 
                            приводит к катастрофическим ошибкам, связанным с записью данных в источник.

                            Функция startextend гарантирует, что все копируемые свойства будут перевоссозданы заново,
                            однако эта функция не осуществляет mixin с существующими значениями $scope, поэтому ее можно
                            использовать только при первичной инициализации.

                            Желательно выяснить по какой причине extend не создает требуемых копий свойств.
                            */
                            startextend($scope, componentFactory.presets['@'].$import.scope);
                            
                            /*
                            Кастомизируем scope
                            */
                            scopeGenerator($element[0].synthetic, $scope);
                        },
                        post: function($scope, $element) {
                            if (!Synthetic($element[0])) return;
                            /*
                            Инициализация директивы полностью завершена и мы можем перейти к 
                            этапу 3
                            */
                            Synthetic($element[0]).__config__.$$angularInitialedStage = 3;
                        }
                    }
                }
            }
        });
    };

    /*
    Начинаем работу с кастомизацией элемента
    */
    var prototype = window[HTMLElementPrototype].prototype;
    var elementOptions = {
        prototype: Object.create(prototype, {
            createdCallback: {
                value: function() {
                    componentCreater.call(this, componentFactory, this.innerHTML);
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
                    this.synthetic.$detach();
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
                                        
                                        $self.$scope.attributes[camelized] = value;
                                        
                                        if (name.substr(0,5)==='data-') {
                                                $self.$scope.properties[camelize(name.substr(5))] = value;
                                        }

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
                                this.synthetic.$scope.attributes[camelize(name)] = value;
                                if (name.substr(0,5)==='data-') {
                                   
                                        this.synthetic.$scope.properties[camelize(name.substr(5))] = value;
                                   
                                }
                            }
                        }
                    }
                }
            }
        })
    };

    // ??????
    //if (componentOptions.extends) elementOptions.extends = componentOptions.extends;

    document.registerElement(name, elementOptions);
    Synthetic.components[name] = componentFactory;
    return componentFactory;
}

Synthetic.getComponent = function(name) {
    if ("object"===typeof Synthetic.components[name])
    return Synthetic.components[name];
    else return new Creed(function(resolve, reject) { reject('Component not found'); });
};

if ("object"===typeof window) window['Synthetic']=Synthetic;
module.exports = Synthetic;