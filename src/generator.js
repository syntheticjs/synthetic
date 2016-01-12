define([
    "./classEvents.js",
    "./templaters/min.js",
    "./modulePrototype.js"
],
function(classEvents, minTemplate, synthetModule) {

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
                return this.render();
            },
            render: function(template, module, args) {
                var $ = this;
                return new Promise(function(resolve, reject) {
                    /*
                    Модификация от sag, позволяюшая устанавливать темплейт посредством выполнения функции, включающей в себя
                    манипуляции с самим элементом
                    */
                    if ("function" === typeof template) {
                        $.$inject(template)();
                        template = $.$.$element.innerHTML;
                    }

                    if (template) $.configuration.template = template;
                    $.configuration.module = "function"===typeof module?module:false;
                    if ($.$.__config__.$$angularInitialedStage>1) {
                        
                        $.$inject(function($self, template, module) {
                            //if ($self.__config__.$$angularScope.$id==22) debugger;
                            $self.__config__.$$angularScope.$applyAsync(function() {
                                var test = Synthetic.$$angularCompile(template, undefined, undefined)($self.__config__.$$angularScope);
                                /*
                                Надо обратить внимание на тот факт, что в случае если к странице подключен jquery angular
                                использует его методы - это звучит немного безумно, т.к. они отличаются от "родных".
                                Так например html у angular действует аналогично set innerHTML и не может принимать
                                данные ввиде массива node. Поэтому для присвоения нового html необходимо использовать
                                append предварительно очищая элемент с помощью html('').
                                */

                                /*
                                Модификация от sag, позволяюшая использовать рендеринг при использовании jQuery, вместо JQLite.
                                */
                                if (Synthetic.$angularjQueryPowered) $self.__config__.$$angularElement.html(test); else $self.__config__.$$angularElement.empty().append(test);
                               

                                /*
                                После установки шаблона необходимо произвести пересмотр scope
                                */
                                

                                $.$.trigger("rendered");
                                resolve($self.__config__.$$angularElement[0]);
                                //$.$.bubbling('shake'); // Shake all roots

                                if (module) {

                                    $.setup(module, args);
                                }
                            });
                            
                        })($.configuration.template, $.configuration.module);
                    } else {
                        $.$.$injectors.$element.innerHTML = $.$.$injectors.$element.innerHTML = minTemplate($.configuration.template, $.$.$injectors.$scope);
                        
                        resolve($.$.$injectors.$element);

                        if ($.configuration.module) {
                            $.setup($.configuration.module);
                        }
                        $.$.trigger("rendered");
                    }
                });
            },
            setup: function(module, args) {

                var $synthet = this.$;

                /*
                Для начала запускаем дестроер для старого модуля, если он есть
                */
                if (null !== this.$.module && "object"===typeof this.$.module&&"function"===typeof this.$.module.$destroy) {
                    this.$.module.$destroy();
                }

                var init = function() {
                    this.$ = $synthet;
                    this.$controller = $synthet;
                };

                var nm = function() {

                }
                .inherit(synthetModule)
                    .inherit(module)
                    .inherit(init);

                /*
                Расширение модуля прототипом указанном в опциях
                */
                if ("function"===typeof this.$.__config__.templateModulePrototype) {
                    nm = nm.inherit(this.$.__config__.templateModulePrototype);
                } else if ("object"===typeof this.$.__config__.templateModulePrototype) {
                    var overMod = function() { }.proto(this.$.__config__.templateModulePrototype);
                    nm = nm.inherit(overMod);
                }  

                /*
                Выносим процедуру инициализации модуля в отдельную функцию для обеспечения возможности
                вызова пользовательской функции initialUserModuleCondition перед ней.

                Согласно версии sx - данная функция сохраняется как метод объекта, что позволит вызывать ее
                из вне. Однако необходимость этого еще нужно проверить.
                */ 
                this.moduleReinit = function() {
                     if (args) {
                        $synthet.module = nm.construct(args);
                    } else {
                        $synthet.module = new nm();
                    }
                };

                if ("function"===typeof this.$.__config__.initialUserModuleCondition) {
                    this.$.__config__.initialUserModuleCondition.call($synthet, this.moduleReinit);
                } else {
                    this.moduleReinit();
                }
               

                //this.$.$injectors.$scope.$module = this.$.module;
            },
            destroy: function() {
                /*
                Очищаем модуль
                */
                if ("object"===typeof this.$.module&&"function"===typeof this.$.module.destory) {
                    this.$.module.destory();
                }

                this.$.module = null;
                /*
                Очищаем наблюдвтелей
                */
                for (var i = 0;i<this.watchers.length;++i) {
                    this.watchers[i]();
                }
                /*
                Очищаем события
                */
                this.clearEventListners();
            }
        });
});