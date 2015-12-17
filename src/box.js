define(function() {
	return function(handler) {
		this.data = {};
		this.stashed = {};
		this.shot = '';
		this.handler = null
		this.context = window;
		
	}.proto({
		initHandler: function(handler, context) {
			if (null===this.handler) {
				this.handler = handler;
				this.context = context;
			}
		},
		get: function(prop) {
			return this.data[prop];
		},
		lookup: function() {
			var data={},diff=false;
			;(arguments.length>1 ? (data={},data[arguments[0]]=arguments[1]) : (data=arguments[0]));
			
			for (var prop in data) {
				if (data.hasOwnProperty(prop)) {
					if (typeof this.stashed[prop] !== typeof data[prop]) diff=true;
					else if (this.stashed[prop]!=data[prop]) diff=true;
					else if ("object"===typeof this.stashed[prop]) {
						if (JSON.stringify(this.stashed[prop])!==JSON.stringify(data[prop])) diff=true;
					}
					this.stashed[prop] = data[prop];
				}
			}
			return diff;
		},
		set: function() {

			var data={},diff=false;
			;(arguments.length>1 ? (data={},data[arguments[0]]=arguments[1]) : (data=arguments[0]));
			
			for (var prop in data) {
				if (data.hasOwnProperty(prop)) {
					if (this.data[prop]!=data[prop]) diff=true;
					this.data[prop] = data[prop];
				}
			}
			return diff;
		},
		/*
		Аналогичен set, но присванивание произовдится лишь один раз при старте.
		Повторное присваивание не производится
		*/
		init: function() {
			var data={};
			;(arguments.length>1 ? (data={},data[arguments[0]]=arguments[1]) : (data=arguments[0]));

			for (var prop in data) {
				if (data.hasOwnProperty(prop)) {
					if ("undefined"!==typeof this.data[prop]) continue;
					this.data[prop] = data[prop];
				}
			}
		},
		$apply: function() {

			this.set.apply(this, arguments);
			this.diffRun();
		},
		diffRun: function() {
			var stringified = JSON.stringify(this.data);
			if (this.shot!==stringified) {
				this.run();
			};
			this.shot = stringified;
		},
		run: function() {
			this.handler.call(this.context, this.data);
		}
	});
});