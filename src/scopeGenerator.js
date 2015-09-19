define([
	"abstudio~mixin@0.1.0",
    "polyvitamins~polychrome@master/gist/convert/camelize.js"
], function(mixin, camelize) {
	return function($self, $$scope, $attrs) {
        /*
        Предотвращаем генерацию контроллера, если элемент уже был удален
        */
        if ($self.$destroyed) return false;

        try {
            angular.extend($$scope, $self.$$scope);
        } catch(e) {
            console.error('test', $$scope );
            throw 'test';
        }
        
        $self.$injectors.$scope = $$scope;
        
        $self.__config__.allWaitingForResolve = false;
        
        $self.__config__.$$angularElement = angular.element($self.$element);

        $self.__config__.$$angularScope = $$scope;
            
            
        ///////////////   
       
        /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
        * Этот код на вес золота, я его решал несколько дней. Его смысл прикрепить контроллер к синтету. *

        Посколько после того как angular проходит стадию bootstrap он перестается следить на деревом, к 
        которому он не относится, все вновь созданные компоненты должны быть инициализированны принудительно.
        За исключением тех случаев, когда шаблон для них устанавливается через интерфейс $generator.render()
        в таком случае angular сам производит инициализацию контроллеров.

        Мною было найдено несколько ресурсов, которые помогли мне решить задачу.

        http://ify.io/lazy-loading-in-angularjs/
        Здесь предлагают использовать $compileProvider. Это решение позволяет создавать новые контроллеры
        уже после активации angular.

        http://stackoverflow.com/a/24058760/5322348
        Здесь был продемонстрирован данный код. Он позволяет компилировать отдельные элементы, вводя их в
        область видимости angular.

        Morulus
        * * * * * * * *  * * * * * * * *  * * * * * * * *  * * * * * * * *  * * * * * * * *  * * * * * * */

        $self.__config__.$$angularInitialedStage = 2;
        $self.trigger('angularResolved');

        
        /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */                   
       
        Object.defineProperty($self, '$$angular', {
            enumerable: false,
            writable: false,
            configurable: false,
            value: Synthetic.$$angularApp
        }); 
    }
});