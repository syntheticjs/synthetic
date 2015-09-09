define([
  "./classEvents.js"
],
function(classEvents) {
   return function(synthet) {
       this.synthet = synthet;
       console.log('#bind angular resolved');
       this.synthet.on('angularResolved', function() {
           /*
            Включаем наблюдение за DOM внутри контроллера
            */
           console.log('start wathcing dom');
           angular.element(synthet.__selfie__.$element).scope().$watch(function(){
               console.log('DOM CHANGED!');
           });
       });

   }.inherit(classEvents)
   .proto({
       $inject: function(callback) {
           return this.synthet.$inject(callback);
       }
   });
});