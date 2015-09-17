define([
	"abstudio~mixin@0.1.0",
], function(mixin) {
	return function($self, $$scope) {
        /*
        Предотвращаем генерацию контроллера, если элемент уже был удален
        */
        if ($self.$destroyed) return false;

        try {
            $scope = angular.element($self.$element).scope().$new(true);
        } catch(e) {
            /*
            Если scope элемента не удалось получить, значит этот элемент используется в
            documentFragment и его инициализировать нельзя
            */
            $self.$destroy();
            return;
        }



        angular.extend($scope, $$scope);
        
        $self.$injectors.$scope = $scope;
        
        $self.__config__.allWaitingForResolve = false;
        
        $self.__config__.$$angularElement = angular.element($self.$element);

        $self.__config__.$$angularScope = $scope;
            
            
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

        setTimeout(function() {

            if ($self.__config__.$$angularInitialedStage>1) return;


            angular.element(document.body).injector().invoke(function($compile) { 

                var scope = angular.element($self.$element).scope(); 
                if (!scope) {
                    /*
                    Если scope для этого элемента не проявляется, значит angular его использует как вспомогательный элемент,
                    инициализировать такой элемент нам не нужно.
                    */

                    $self.$destroy();
                } else {
                    /*
                    Воизбежание переиницаилизации мы должны игнорировать директиву
                    ngRepeat. Игнорирование прочих директив не исключено, то их поведение
                    еще не выявлено.
                    */                                                    
                    $compile($self.$element, undefined, undefined, 'ngRepeat')(scope); 
                }

                sx.debug.evaluate('create-comp'+$self.randomId, 'invk');

                Synthetic.$$angularTimeout(function() {
                    $self.__config__.$$angularInitialedStage = 2;
                    $self.trigger('angularResolved');
                    sx.debug.evaluate('create-comp'+$self.randomId, '@end');
                });

            });
        });
        /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */                   
       
        Object.defineProperty($self, '$$angular', {
            enumerable: false,
            writable: false,
            configurable: false,
            value: Synthetic.$$angularApp
        });           
       
        Object.defineProperty($self, '$$angular', {
            enumerable: false,
            writable: false,
            configurable: false,
            value: Synthetic.$$angularApp
        });
    }
});