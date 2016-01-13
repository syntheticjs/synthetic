require('polyinherit');
module.exports = function() {
    //console.debug('DEBUG ME: because im starting after module initialization. This is very baaad.');
}.proto({
    $apply: function(cb) {
        return this.$.$apply(cb);
    },
    /*
     Данная функция выполняет некую процедуру, остаточные объектвы которые будут удалены
     возвращаемой функцийей
     */
    $hitch: function(cb, keys) {
        
        var fkey = cb.toString()+("object"===typeof keys ? JSON.stringify(keys) : (keys ? keys.toString() : '') );
        
        if ("function"===typeof this.$hitchers[fkey]) this.$hitchers[fkey].call(this);
        this.$hitchers[fkey] = this.$.$run(cb);

        return function(i) {
            this.$hitchers[i].call(this); delete this.$hitchers[i];
        }.bind(this, fkey)
    },
    $destroy: function() {
        /*
        Очищаем hitchers
        */
        for (var i in this.$hitchers) {
           
            if (this.$hitchers.hasOwnProperty(i)&&"function"===typeof this.$hitchers[i]) {
                this.$hitchers[i].call(this);
            }
        }
    }
});