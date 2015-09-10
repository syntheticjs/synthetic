define(function() {
	var preFactory = function(options) {
		this.options = options;
		this.onCreatedCallbacks = [];
		this.onAttachedCallbacks = [];
		this.onDetachedCallbacks = [];
		this.onAttributeChangedCallbacks = [];
		this.generator = false;
		this.prototypes = [];
		this.constructors = [];
		this.watchers = [];
		this.conceivedCallers = [];
	}
	preFactory.prototype = {
		constructor: preFactory,
		$addConceivedMethod: function(fn, args) {
			this.conceivedCallers.push([fn, args]);
		},
		created: function(callback) {
			
			this.onCreatedCallbacks.push(callback);
			return this;
		},
		attached: function(callback) {
			this.onAttachedCallbacks.push(callback);
			return this;
		},
		detached: function(callback) {
			this.onDetachedCallbacks.push(callback);
			return this;
		},
		attributeChanged: function(callback) {
			this.onAttributeChangedCallbacks.push(callback);
			return this;
		},
		watch: function() {
			this.watchers.push(Array.prototype.slice.apply(arguments));
			return this;
		},
		proto: function(proto) {
			this.prototypes.push(proto);
		},
		construct: function(c) {
			this.constructors.push(c);
		},
		template: function() {
			this.$addConceivedMethod('template', arguments);
		}
	}

	return preFactory;
})