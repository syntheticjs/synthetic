define([
	"./../getObjectByXPath.js"
],

	function(getObjectByXPath) {
		var each = function(subject, fn) {
			for (var prop in subject) {
				if (subject.hasOwnProperty(prop)) {
					fn.call(subject, subject[prop], prop);
				}
			}
		},
		regPlaceholder = /\{\{([^\} ]*)\}\}/gi;

		return function(tpl, data, preProcessor, postProcessor) {

			var template=tpl, matches = template.match(regPlaceholder);

            if (matches!==null)
            matches.forEach(function(dph) {
                regPlaceholder.lastIndex = 0;
                var placeholderData = regPlaceholder.exec(dph), 
                placeholder = placeholderData[1];
                template = template.replace(dph, getObjectByXPath(data, placeholder.split('.')));
            });
        	
            return template;
		}
});