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
        this.$.on('angularResolved', function() {
            /*
             Включаем наблюдение за DOM внутри контроллера
             */
            var $ = this;
            angular.element(synthet.__selfie__.$element).scope().$watch(function(){
                $.trigger("DOMChanged");
            });
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
                console.log('re-render', this.$.$element);
                var $ = this;
                if (template) this.configuration.template = template;
                this.configuration.module = "function"===typeof module?module:false;
                if (this.$.__config__.$$angularInitialedStage>1) {
                    
                    this.$inject(function($self, template, module) {

                        var test = $self.__config__.$$angularCompile(template)($self.__config__.$$angularScope);
                        $self.__config__.$$angularElement.html(test);
                        
                        $.trigger("DOMChanged");
                        if (module) {
                            $.setup(module);
                        }
                    })(this.configuration.template, this.configuration.module);
                } else {
                    this.$.__selfie__.$element.innerHTML = this.$.__selfie__.$element.innerHTML = minTemplate(this.configuration.template, this.$.__selfie__.$scope);
                    
                    if (this.configuration.module) {
                        $.setup(this.configuration.module);
                    }
                    this.trigger("DOMChanged");
                }
            },
            setup: function(module) {

                var nm = function($synthet) {
                    
                }.inherit(module)
                .inherit(synthetModule);
                this.$.module = new nm(this.$);
            }
        });
});