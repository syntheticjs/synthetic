define(function() {
	return function(start, xpath) {
		
		for (var i = 0;i<xpath.length;++i) {
			if ("undefined"===typeof start[xpath[i]]) return false;
			if ("object"!==typeof start[xpath[i]] && i!==xpath.length-1) return false;
			start=start[xpath[i]];
		}

		return start;
	}
});