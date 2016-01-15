var Creed = require("polypromise").Creed;
var smartCallback = require("./smartCallback.js");
var extend = require('extend');

module.exports = function(name, workshop) {
	this.name = name;
	this.performed = false;
	this.$import = {
		config: {},
		prototype: {},
		scope: {}, // Default scope
		onConstruct: [], // Functions on construct
		onCreate: [], // Functions on created
		onAttach: [], // Functions on attached
		onDetach: [], // Functions on detached
		onDestroy: [], // Functions on destroyed
		conceivedCallers: [], // After create static functions
		watchers: [], // Default watchers
		template: false, // Default template (can be an array 1 => String, 2 => Class)
		attrsChange: [] // Change attrs callbacks
	};

	this.$run(workshop);

	
}.inherit(Creed)
.proto({
	$conceivedCallers: function(fn, args) {
		this.$import.conceivedCallers.push([fn, args]);
	},
	$create: function(callback) {
		this.$import.onCreate.push(callback);
	},
	// Construct (onCreated callback)
	$construct: function(callback) {
		this.$import.onConstruct.push(callback);
	},
	// Attach callback
	$attach: function(callback) {
		this.$import.onAttach.push(callback);
	},
	// Detach callback
	$detach: function(callback) {
		this.$import.onDetach.push(callback);
	},
	// Destroy callback
	$destroy: function(callback) {
		this.$import.onDestroy.push(callback);
	},
	// Extend scope
	$scope: function(data) {
		extend(this.$import.scope, data);
	},
	// Watchers
	$watch: function() {
		this.$import.watchers.push(Array.prototype.slice.apply(arguments));
	},
	// Prototype
	$methods: function(prototype) {
		extend(this.$import.prototype, prototype);
	},
	// Default config
	$config: function(config) {
		if ("object"!==typeof config) throw 'Configuration must be an object';
		extend(this.$import.config, config);
	},
	// Template
	$template: function() {
		this.$import.template = Array.prototype.slice.apply(arguments);
	},
	// Attrs change callbacks
	$attrsChange: function(callback) {
		this.$import.attrsChange.push(callback);
	},
	// run preset creator workshop
	$run: function(workshop) {
		var self = this, prototype = smartCallback.call({
			// It self
			$component: this,
			$conceivedCallers: function() { self.$conceivedCallers.apply(self, arguments); },
			$create: function() { self.$create.apply(self, arguments); },
			$construct: function() { self.$construct.apply(self, arguments); },
			$attach: function() { self.$attach.apply(self, arguments); },
			$detach: function() { self.$detach.apply(self, arguments); },
			$destroy: function() { self.$destroy.apply(self, arguments); },
			$scope: function() { self.$scope.apply(self, arguments); },
			$watch: function() { self.$watch.apply(self, arguments); },
			$methods: function() { self.$methods.apply(self, arguments); },
			$config: function() { self.$config.apply(self, arguments); },
			$template: function() { self.$template.apply(self, arguments); },
			$attrsChange: function() { self.$template.apply(self, arguments); }
		}, this)();

		if ("object"===typeof prototype) {
	        extend(this.$import.prototype, prototype);
	    }

	    return this;
	},
	// use preset reader workshop
	$use: function(workshop, context, getinjector) {
		var injector = smartCallback.call(this.$import, workshop, context||this);
		if (getinjector) return injector;
		injector();
		return this;
	}
});