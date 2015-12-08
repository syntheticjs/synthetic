define(function() {
	return function(handler) {
		this.data = {};
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