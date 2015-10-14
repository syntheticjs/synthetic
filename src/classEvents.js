define([
"./smartCallback.js",
], function(smartCallback) {
	var Events = function() {
		this.eventListners = {};
        this.bubblingListners = {};
        this.surfacingListners = {};
		this.eventTracks = {};
	}

    /*
    eventListner
    */
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
	};

    /*
    BubblingListner
    */
    var bubblingListner = function(own, event, i) {
        this.owner = own;
        this.event = event;
        this.index = i;
    }
    bubblingListner.prototype = {
        constructor: bubblingListner,
        destroy: function() {
            this.owner.bubblingListners[this.event][this.index] = null;
            this.owner = null;
            this.event = null;
            this.index = null;
        }
    };

    /*
    surfacingListner
    */
    var surfacingListner = function(own, event, i) {
        this.owner = own;
        this.event = event;
        this.index = i;
    }
    surfacingListner.prototype = {
        constructor: surfacingListner,
        destroy: function() {
            this.owner.surfacingListners[this.event][this.index] = null;
            this.owner = null;
            this.event = null;
            this.index = null;
        }
    };


	Events.prototype = {
		constructor: Events,
        capture: function(e, callback, once) {
            if (typeof this.surfacingListners[e] != 'object') this.surfacingListners[e] = [];

            this.surfacingListners[e].push({
                callback: this.$inject(callback),
                once: once||false
            });

            /*
            Call callback if event already fired
            */
            return new surfacingListner(this, e, this.surfacingListners[e].length-1);
        },
        uncapture: function(e, handler) {
            if (this.surfacingListners[e]) {
                if ("undefined"===typeof handler) delete this.surfacingListners[e];
                else
                    for (var i = 0; i < this.surfacingListners[e].length; ++i) {
                        if (this.surfacingListners[e][i]&&this.surfacingListners[e][i].callback===handler) this.surfacingListners[e][i] = null;
                    }
            }
            return this;
        },
        surface: function() {
          this.plunge.apply(this, arguments);
        },
        plunge: function(e, args) {
            var response = null;
            if (typeof this.surfacingListners[e] == 'object' && this.surfacingListners[e].length>0) {
                var todelete = [];
                for (var i = 0; i<this.surfacingListners[e].length; i++) {
                    if (this.surfacingListners[e][i]!==null) {
                        if (typeof this.surfacingListners[e][i].callback === "function") response = this.surfacingListners[e][i].callback.apply(this, args);

                        if (this.surfacingListners[e][i].once) {

                            todelete.push(i);
                        };
                        if (response===false) { return response; }
                    };
                };

                if (todelete.length>0) for (var i in todelete) {
                    this.surfacingListners[e][todelete[i]] = null;
                };
            };

            // Surface it
            if (this.$childs) {
                for (var i = 0;i<this.$childs.length;++i) {
                    this.$childs[i].surface(e, args);
                }
            }

            return response;
        },
        sense: function(e, callback, once) {
            if (typeof this.bubblingListners[e] != 'object') this.bubblingListners[e] = [];

            this.bubblingListners[e].push({
                callback: this.$inject(callback),
                once: once||false
            });

            /*
            Call callback if event already fired
            */
            return new bubblingListner(this, e, this.bubblingListners[e].length-1);
        },
        unsense: function(e, handler) {
            if (this.bubblingListners[e]) {
                if ("undefined"===typeof handler) delete this.bubblingListners[e];
                else
                for (var i = 0; i < this.bubblingListners[e].length; ++i) {
                    if (this.bubblingListners[e][i]&&this.bubblingListners[e][i].callback===handler) this.bubblingListners[e][i] = null;
                }
            }
            return this;
        },
        bubbling: function(e, args) {
            var response = null;
            if (typeof this.bubblingListners[e] == 'object' && this.bubblingListners[e].length>0) {
                var todelete = [];
                for (var i = 0; i<this.bubblingListners[e].length; i++) {
                    if (this.bubblingListners[e][i]!==null) {
                        if (typeof this.bubblingListners[e][i].callback === "function") response = this.bubblingListners[e][i].callback.apply(this, args);

                        if (this.bubblingListners[e][i].once) {

                            todelete.push(i);
                        };
                        if (response===false) { return response; }
                    };
                };

                if (todelete.length>0) for (var i in todelete) {
                    this.bubblingListners[e][todelete[i]] = null;
                };
            };

            // Bubbling itself
            if (this.$parent) this.$parent.bubbling(e, args);

            return response;
        },
		bind : function(e, callback, once) {
			if (typeof this.eventListners[e] != 'object') this.eventListners[e] = [];
			
			this.eventListners[e].push({
				callback: callback,
				once: once
			});

			return this;
		},
        unbind: function(e, handler) {
            if (this.eventListners[e]) {
                if ("undefined"===typeof handler) delete this.eventListners[e];
                else
                    for (var i = 0; i < this.eventListners[e].length; ++i) {
                        if (this.eventListners[e][i]&&this.surfacingListners[e][i].callback===handler) this.surfacingListners[e][i] = null;
                    }
            }
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
