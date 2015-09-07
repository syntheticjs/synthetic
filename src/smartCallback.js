define(function() {
	var funcarguments = new RegExp(/[\d\t]*function[ ]?\(([^\)]*)\)/i),
	scopesregex = /({[^{}}]*[\n\r]*})/g,
	funcarguments = new RegExp(/[\d\t]*function[ ]?\(([^\)]*)\)/i),
	getFunctionArguments = function(code) {
		if (funcarguments.test(code)) {
			var match = funcarguments.exec(code);
			return match[1].replace(' ','').split(',');
		}
		return [];
	};

	return function(callback) {
		var prefixedArguments = [],
		requiredArguments = getFunctionArguments(callback.toString());

		for (var i = 0;i<requiredArguments.length;++i) {
			if (this.hasOwnProperty(requiredArguments[i])&&"object"===typeof this[requiredArguments[i]]) {
				prefixedArguments[i] = this[requiredArguments[i]];
			}
		}


		
		return function() {
			return callback.apply(this, prefixedArguments.concat(Array.prototype.slice.call(arguments)));
		}
	}
});