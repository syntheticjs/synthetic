define(function() {
	return function() {

		if ("undefined"===typeof angular) {
			console.error('Synthetic: Connect angularjs to work with');
			return false;
		}

		
		// Bootstrap angular
		angular.element(this.__selfie__.$element).ready(function() {
		  angular.bootstrap(this.__selfie__.$element, [this.$$angularModuleName]);
		}.bind(this));
	}
});