define(function() {
	return function(newValue) {
		// TODO: can we call this staff only when data is compiled???
		//if (/^{{[^}}]*}}$/.test(newValue)) console.error('Scopes detected', newValue);
		return /^{{[^}}]*}}$/i.test(newValue)||newValue===undefined ? undefined : newValue;
	}
});