define(function() {
	var preFactory = function() {
		this.onCreatedCallbacks = [];
		this.onAttachedCallbacks = [];
		this.onDetachedCallbacks = [];
		this.onAttributeChangedCallbacks = [];
		this.generator = false;
		this.prototypes = [];
		this.constructors = [];
		this.watchers = [];
	}
	preFactory.prototype = {
		constructor: preFactory,
		created: function(callback) {
			this.onCreatedCallbacks.push(callback);
			return this;
		},
		attached: function(callback) {
			this.onAttachedCallbacks.push(callback);
			return this;
		},
		dettached: function(callback) {
			this.onDetachedCallbacks.push(callback);
			return this;
		},
		attributeChanged: function() {
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
		template: function(source,engine,buildOn) {
			this.generator = {
				template: source,
				engine: engine||false,
				buildOn: buildOn||['created']
			}
		}
	}

	return preFactory;
})