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
		}
	})

});