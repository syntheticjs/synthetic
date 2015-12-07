define(function() {

	return function($) {
		this.$ = $; // Link to synthetic controller
	}.proto({
		/* Функуция добавляет или удаляет элемент из массива */
		toggleAppend: function(collection, value, force) {
			
			this.$.$apply(function() {
				if ("boolean"!==typeof force) force = !~collection.indexOf(value);
				if (force) {
					collection.push(value);
				} else {
					collection.splice(collection.indexOf(value), 1);
				}
			});
		},
		toggle: function($value) {
            if ("object" == typeof $value && arguments.length > 1) {
                this.toggleAppend.apply(this, arguments);
            } else {

                return !$value;
            }
        }
	})

});