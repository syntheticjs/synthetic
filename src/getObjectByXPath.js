module.exports = function(start, xpath) {
	
	for (var i = 0;i<xpath.length;++i) {
		if ("object"!==typeof start) return false;
		if ("undefined"===typeof start[xpath[i]]) return false;
		start=start[xpath[i]];
	}

	return start;
};