define([
    "./classEvents.js",
    "templaters/min.js"
],
function(classEvents, minTemplate) {
    return function(synthet) {
        this.$ = synthet;
        this.configuration = {
            template: false
        }
        console.log('#bind angular resolved');
        this.$.on('angularResolved', function() {
            /*
             Включаем наблюдение за DOM внутри контроллера
             */
            var $ = this;
            angular.element(synthet.__selfie__.$element).scope().$watch(function(){
                console.log('DOM CHANGED!');
                $.trigger("DOMChanged");
            });
        });

    }.inherit(classEvents)
        .proto({
            $inject: function(callback) {
                return this.$.$inject(callback);
            },
            template: function(template) {
                this.configuration.template = template;
                this.render();
            },
            render: function(template) {
                if (template) this.configuration.template = template;

                if (this.$.__config__.$$angularInitialedStage>1) {
                    this.$inject(function($self, template) {

                        var test = $self.__config__.$$angularCompile(template)($self.__config__.$$angularScope);
                        $self.__config__.$$angularElement.append(test);
                    })(this.configuration.template);
                } else {
                    this.$.__selfie__.$element.innerHTML = this.$.__selfie__.$element.innerHTML = minTemplate(this.configuration.template, this.$.__selfie__.$scope);
                    console.log('Change event>>', this);
                    this.trigger("xxx");
                }
            }
        });
});