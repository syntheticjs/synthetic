define(function() {
    return function() {

            this.$hitchers = [];
            this.bind('destroy', function() {
                for (var i = 0;i<this.$hitchers.length;++i) {
                    this.$hitchers();
                }
            });
        }.proto({
            $apply: function(cb) {
                return this.$.$apply(cb);
            },
            /*
             Данная функция выполняет некую процедуру, остаточные объектвы которые будут удалены
             возвращаемой функцийей
             */
            $hitch: function(cb) {
                this.$hitchers.push(this.$.$run(cb));
                return function(i) {
                    this.$hitchers[i].call(this); this.$hitchers[i] = null;
                }.bind(this, this.$hitchers.length-1)
            }
        });
});