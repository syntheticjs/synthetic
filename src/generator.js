define([
    "./classEvents.js",
    "./templaters/min.js"
],
function(classEvents, minTemplate) {
    /*
    Этим классом будут расширяться все входящие модули темплейтов
    Он дает минимальный API для работы с компонентом
    */
    var synthetModule = function($synthet) {
        this.$synthet = $synthet;
        this.$controller = $synthet;
        this.$apply = function(cb) {
            return $synthet.$apply(cb);
        }
    }
    return function(synthet) {
        this.$ = synthet;
        this.configuration = {
            template: false
        }
        this.watchers = [];
        this.$.on('angularResolved', function() {
            /*
             Включаем наблюдение за DOM внутри контроллера
             */
            var $ = this;
            try {
                this.watchers.push(angular.element(synthet.$injectors.$element).scope().$watch(function(){
                    $.trigger("DOMChanged");
                }));
            }
            catch(e) {

            }
        });

    }.inherit(classEvents)
        .proto({
            $inject: function(callback) {
                return this.$.$inject(callback);
            },
            template: function(template, module) {
                this.configuration.template = template;
                this.configuration.module = "function"===typeof module?module:false;
                this.render();
            },
            render: function(template, module) {

                
                var $ = this;
                if (template) this.configuration.template = template;
                this.configuration.module = "function"===typeof module?module:false;
                if (this.$.__config__.$$angularInitialedStage>1) {
                    
                    this.$inject(function($self, template, module) {
                        //if ($self.__config__.$$angularScope.$id==22) debugger;
                        var test = Synthetic.$$angularCompile(template, undefined, undefined)($self.__config__.$$angularScope);
                        /*
                        Надо обратить внимание на тот факт, что в случае если к странице подключен jquery angular
                        использует его методы - это звучит немного безумно, т.к. они отличаются от "родных".
                        Так например html у angular действует аналогично set innerHTML и не может принимать
                        данные ввиде массива node. Поэтому для присвоения нового html необходимо использовать
                        append предварительно очищая элемент с помощью html('').
                        */
                        
                        $self.__config__.$$angularElement.html('').append(test);

                        /*
                        После установки шаблона необходимо произвести пересмотр scope
                        */
                        $self.__config__.$$angularScope.$digest();

                        $.$.trigger("rendered");
                        if (module) {
                            $.setup(module);
                        }
                    })(this.configuration.template, this.configuration.module);
                } else {
                    this.$.$injectors.$element.innerHTML = this.$.$injectors.$element.innerHTML = minTemplate(this.configuration.template, this.$.$injectors.$scope);
                    
                    if (this.configuration.module) {
                        $.setup(this.configuration.module);
                    }
                    this.$.trigger("rendered");
                }
            },
            setup: function(module) {

                var nm = function($synthet) {
                    
                }.inherit(module)
                .inherit(synthetModule);

                /*
                Расширение модуля прототипом указанном в опциях
                */
                if ("function"===typeof this.$.__config__.templateModulePrototype) {
                    nm = nm.inherit();
                } else if ("object"===typeof this.$.__config__.templateModulePrototype) {
                    var overMod = function() { }.proto(this.$.__config__.templateModulePrototype);
                    nm = nm.inherit(overMod);
                }
                this.$.module = new nm(this.$);
            },
            destroy: function() {
                /*
                Очищаем модуль
                */
                if ("object"===typeof this.module&&"function"===typeof this.module.destory) {
                    this.module.destory();
                    this.module = null;
                }
                /*
                Очищаем наблюдвтелей
                */
                for (var i = 0;i<this.watchers.length;++i) {
                    his.watchers[i]();
                }
                /*
                Очищаем события
                */
                this.clearEventListners();
            }
        });
});