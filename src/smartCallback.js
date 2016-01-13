
	var funcarguments = new RegExp(/[\d\t]*function[ ]?\(([^\)]*)\)/i), 
    scopesregex = /({[^{}}]*[\n\r]*})/g, 
    funcarguments = new RegExp(/[\d\t]*function[ ]?\(([^\)]*)\)/i), 
    getFunctionArguments = function(code) {
        if (funcarguments.test(code)) {
            var match = funcarguments.exec(code);
            return match[1].replace(/[\s\n\r\t]*/g,'').split(',');
        }
        return [];
    };
    module.exports = function(callback, context) {
        var prefixedArguments = [], 
        requiredArguments = getFunctionArguments(callback.toString());

        for (var i = 0; i < requiredArguments.length; ++i) {
            if (this instanceof Array) {
                for (var j = 0; j < this.length; ++j) {
                    if (this[j].hasOwnProperty(requiredArguments[i]) 
                        && ("object" === typeof this[j][requiredArguments[i]] || "function" === typeof this[j][requiredArguments[i]])) {
                        prefixedArguments[i] = this[j][requiredArguments[i]];
                    }
                }
            } else if (this.hasOwnProperty(requiredArguments[i]) && ("object" === typeof this[requiredArguments[i]] || "function" === typeof this[requiredArguments[i]])) {
                prefixedArguments[i] = this[requiredArguments[i]];
            }
        }
        var injected = function() {

            return callback.apply(context || this, prefixedArguments.concat(Array.prototype.slice.call(arguments)));
        };
        injected.$$injected = true;
        return injected;
    };