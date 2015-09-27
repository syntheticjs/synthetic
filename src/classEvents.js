define([
"./smartCallback.js",
], function(smartCallback) {
	var Events = function() {
		this.eventListners = {};
		this.eventTracks = {};
	}

	var eventListner = function(own, event, i) {
		this.owner = own;
		this.event = event;
		this.index = i;
	}
	eventListner.prototype = {
		constructor: eventListner,
		destroy: function() {
			this.owner.eventListners[this.event][this.index] = null;
			this.owner = null;
			this.event = null;
			this.index = null;
		}
	}

	Events.prototype = {
		constructor: Events,
		bind : function(e, callback, once) {
			if (typeof this.eventListners[e] != 'object') this.eventListners[e] = [];
			
			this.eventListners[e].push({
				callback: callback,
				once: once
			});

			return this;
		},
		on: function(e, callback, once) {
			if (typeof this.eventListners[e] != 'object') this.eventListners[e] = [];
			
			this.eventListners[e].push({
				callback: this.$inject(callback),
				once: once||false
			});

			/*
			Call callback if event already fired
			*/
			if ("object"===typeof this.eventTracks[e]) callback.apply(this.eventTracks[e][0], this.eventTracks[e][1]);

			return new eventListner(this, e, this.eventListners[e].length-1);
		},
		once : function(e, callback) {
			this.bind(e, callback, true);
			return this;
		},
		trigger : function() {			
			if (typeof arguments[0] == 'integer') {
				var uin = arguments[0];
				var e = arguments[1];
				var args = (arguments.length>2) ? arguments[2] : [];
			} else {
				var uin = false;
				var e = arguments[0];
				var args = (arguments.length>1) ? arguments[1] : [];
			};
			
			var response = false;

			
			this.eventTracks[e]=[this, args];

			if (typeof this.eventListners[e] == 'object' && this.eventListners[e].length>0) {
				var todelete = [];
				for (var i = 0; i<this.eventListners[e].length; i++) {
					if (this.eventListners[e][i]!==null) {
						if (typeof this.eventListners[e][i].callback === "function") response = this.eventListners[e][i].callback.apply(this, args);
						
						if (this.eventListners[e][i].once) {

							todelete.push(i);
						};
					};
				};
				
				if (todelete.length>0) for (var i in todelete) {
					this.eventListners[e][todelete[i]] = null;
				};
			};
			return response;
		},
		/*
		Очищает от событий
		*/
		clearEventListners: function() {
			this.eventListners = {};
		}
	}

	return Events;
});
