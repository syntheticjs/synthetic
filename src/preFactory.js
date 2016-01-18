// onCreatedCallbacks


	var mixin = require("mixin");
	var Creed = require("polypromise").Creed;
	var smartCallback = require("./smartCallback.js");
	var ComponentPreset = require("./ComponentPreset.js");

	var preFactory = function(options) {
		this.name = options.name;
		this.engine = options.engine;
		this.config = {}; // Configuration
		this.presets = {}; // List of user presets
	}
	.inherit(Creed)
	.proto({
		constructor: preFactory,
		// Temp method
		$addConceivedMethod: function(fn, args) {
			this.presets['@'].$conceivedCallers(fn, args);
		},
		created: function(callback) {
			this.presets['@'].$onCreate(callback);
			return this;
		},
		attached: function(callback) {
			this.presets['@'].$onAttach(callback);
			return this;
		},
		detached: function(callback) {
			this.presets['@'].$onDetach(callback);
			return this;
		},
		attributeChanged: function(callback) {
			this.presets['@'].$observeAttrs(callback);
			return this;
		},
		watch: function() {
			this.presets['@'].$watch.apply(this.presets['@'], Array.prototype.slice.apply(arguments));
			return this;
		},
		proto: function(proto) {
			this.presets['@'].$methods(proto);
			return this;
		},
		construct: function(c) {
			this.presets['@'].$cunstruct(callback);
			return this;
		},
		template: function() {
			this.presets['@'].$template.apply(this.presets['@'], Array.prototype.slice.apply(arguments));
			return this;
		},
		config: function(config) {
			this.presets['@'].$config(config);
			return this;
		},
		createPreset: function(name, workshop) {

			this.presets[name] = new ComponentPreset(this, name, workshop);
			return this.presets[name];
		},
		/*
		Execute workshop with prest
		*/
		$usePreset: function(name, workshop, context) {
			if (!(name instanceof Array)) name = [name];
			for (var i = 0;i<name.length;++i) {
				if ("object"!==typeof this.presets[name[i]]) throw 'Undefined preset';
				this.presets[name[i]].$use(workshop, context);
			}
			return this;
		}
	});

	module.exports = preFactory;