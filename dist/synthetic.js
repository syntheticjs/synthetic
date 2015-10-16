(function(m, o, r, u, l, u, s) {
    var mixin = function() {
        var mixinup = function(a, b) {
            for (var i in b) {
                if (b.hasOwnProperty(i)) {
                    a[i] = b[i];
                }
            }
            return a;
        };
        return function(a) {
            var i = 1;
            for (;i < arguments.length; i++) {
                if ("object" === typeof arguments[i]) {
                    mixinup(a, arguments[i]);
                }
            }
            return a;
        };
    }();
    var smartCallback = function() {
        var funcarguments = new RegExp(/[\d\t]*function[ ]?\(([^\)]*)\)/i), scopesregex = /({[^{}}]*[\n\r]*})/g, funcarguments = new RegExp(/[\d\t]*function[ ]?\(([^\)]*)\)/i), getFunctionArguments = function(code) {
            if (funcarguments.test(code)) {
                var match = funcarguments.exec(code);
                return match[1].replace(/ /g, "").split(",");
            }
            return [];
        };
        return function(callback, context) {
            var prefixedArguments = [], requiredArguments = getFunctionArguments(callback.toString());
            for (var i = 0; i < requiredArguments.length; ++i) {
                if (this.hasOwnProperty(requiredArguments[i]) && "object" === typeof this[requiredArguments[i]]) {
                    prefixedArguments[i] = this[requiredArguments[i]];
                }
            }
            return function() {
                return callback.apply(context || this, prefixedArguments.concat(Array.prototype.slice.call(arguments)));
            };
        };
    }();
    var mixin2 = function() {
        var mixinup = function(a, b) {
            for (var i in b) {
                if (b.hasOwnProperty(i)) {
                    a[i] = b[i];
                }
            }
            return a;
        };
        return function(a) {
            var i = 1;
            for (;i < arguments.length; i++) {
                if ("object" === typeof arguments[i]) {
                    mixinup(a, arguments[i]);
                }
            }
            return a;
        };
    }();
    var inherit = function(mixin) {
        return function(aClass, classes) {
            if (!(classes instanceof Array)) classes = [ classes ];
            var cl = classes.length;
            var superconstructor = function() {
                var args = Array.prototype.slice.apply(arguments);
                if ("object" !== typeof this.constructors) Object.defineProperty(this, "constructors", {
                    configurable: false,
                    enumerable: false,
                    writable: false,
                    value: []
                });
                for (var i = 0; i < cl; ++i) {
                    if (this.constructors.indexOf(classes[i]) >= 0) continue;
                    this.constructors.push(classes[i]);
                    classes[i].apply(this, args);
                }
            }, superprototype = superconstructor.prototype = {};
            if (aClass.prototype && aClass.prototype !== null && aClass.prototype.__super__) mixin(superprototype, aClass.prototype.__super__);
            for (var i = 0; i < cl; ++i) {
                if (classes[i].prototype) {
                    if (classes[i].prototype.__super__) superprototype = mixin(superprototype, classes[i].prototype.__super__);
                    superprototype = mixin(superprototype, classes[i].prototype);
                }
            }
            superprototype.constructor = superconstructor;
            var Mixin = function() {
                if (this.constructor && this.constructor.__disableContructor__) {
                    this.constructor.__disableContructor__ = false;
                    return false;
                }
                var args = Array.prototype.slice.apply(arguments);
                if (!(this === window)) {
                    superconstructor.apply(this, args);
                }
                aClass.apply(this, args);
            };
            Mixin.prototype = Object.create(superprototype, {
                __super__: {
                    configurable: false,
                    enumerable: false,
                    writable: false,
                    value: superprototype
                }
            });
            if (aClass.prototype) mixin(Mixin.prototype, aClass.prototype);
            for (var prop in aClass) {
                if (aClass.hasOwnProperty(prop)) Mixin[prop] = aClass[prop];
            }
            Object.defineProperty(Mixin.prototype, "constructor", {
                configurable: false,
                enumerable: false,
                writable: false,
                value: Mixin
            });
            if (!Mixin.prototype.__proto__) {
                Mixin.prototype.__proto__ = Mixin.prototype;
            }
            return Mixin;
        };
    }(mixin);
    Function.prototype.inherit = function() {
        var classes = Array.prototype.slice.apply(arguments);
        return inherit(this, classes);
    };
    Function.prototype.proto = function(proto) {
        if ("object" !== typeof this.prototype) this.prototype = {
            constructor: this
        };
        mixin(this.prototype, proto);
        return this;
    };
    Function.prototype.construct = function() {
        this.__disableContructor__ = true;
        var module = new this();
        var args = arguments[0] instanceof Array ? arguments[0] : [];
        this.apply(module, args);
        return module;
    };
    var camelize = function() {
        return function(text) {
            return text.replace(/-([\da-z])/gi, function(all, letter) {
                return letter.toUpperCase();
            });
        };
    }();
    var classEvents = function(smartCallback) {
        var Events = function() {
            this.eventListners = {};
            this.bubblingListners = {};
            this.surfacingListners = {};
            this.eventTracks = {};
        };
        var eventListner = function(own, event, i) {
            this.owner = own;
            this.event = event;
            this.index = i;
        };
        eventListner.prototype = {
            constructor: eventListner,
            destroy: function() {
                this.owner.eventListners[this.event][this.index] = null;
                this.owner = null;
                this.event = null;
                this.index = null;
            }
        };
        var bubblingListner = function(own, event, i) {
            this.owner = own;
            this.event = event;
            this.index = i;
        };
        bubblingListner.prototype = {
            constructor: bubblingListner,
            destroy: function() {
                this.owner.bubblingListners[this.event][this.index] = null;
                this.owner = null;
                this.event = null;
                this.index = null;
            }
        };
        var surfacingListner = function(own, event, i) {
            this.owner = own;
            this.event = event;
            this.index = i;
        };
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
                if (typeof this.surfacingListners[e] != "object") this.surfacingListners[e] = [];
                this.surfacingListners[e].push({
                    callback: this.$inject(callback),
                    once: once || false
                });
                return new surfacingListner(this, e, this.surfacingListners[e].length - 1);
            },
            uncapture: function(e, handler) {
                if (this.surfacingListners[e]) {
                    if ("undefined" === typeof handler) delete this.surfacingListners[e]; else for (var i = 0; i < this.surfacingListners[e].length; ++i) {
                        if (this.surfacingListners[e][i] && this.surfacingListners[e][i].callback === handler) this.surfacingListners[e][i] = null;
                    }
                }
                return this;
            },
            surface: function() {
                this.plunge.apply(this, arguments);
            },
            plunge: function(e, args) {
                var response = null;
                if (typeof this.surfacingListners[e] == "object" && this.surfacingListners[e].length > 0) {
                    var todelete = [];
                    for (var i = 0; i < this.surfacingListners[e].length; i++) {
                        if (this.surfacingListners[e][i] !== null) {
                            if (typeof this.surfacingListners[e][i].callback === "function") response = this.surfacingListners[e][i].callback.apply(this, args);
                            if (this.surfacingListners[e][i].once) {
                                todelete.push(i);
                            }
                            if (response === false) {
                                return response;
                            }
                        }
                    }
                    if (todelete.length > 0) for (var i in todelete) {
                        this.surfacingListners[e][todelete[i]] = null;
                    }
                }
                if (this.$childs) {
                    for (var i = 0; i < this.$childs.length; ++i) {
                        this.$childs[i].surface(e, args);
                    }
                }
                return response;
            },
            sense: function(e, callback, once) {
                if (typeof this.bubblingListners[e] != "object") this.bubblingListners[e] = [];
                this.bubblingListners[e].push({
                    callback: this.$inject(callback),
                    once: once || false
                });
                return new bubblingListner(this, e, this.bubblingListners[e].length - 1);
            },
            unsense: function(e, handler) {
                if (this.bubblingListners[e]) {
                    if ("undefined" === typeof handler) delete this.bubblingListners[e]; else for (var i = 0; i < this.bubblingListners[e].length; ++i) {
                        if (this.bubblingListners[e][i] && this.bubblingListners[e][i].callback === handler) this.bubblingListners[e][i] = null;
                    }
                }
                return this;
            },
            bubbling: function(e, args) {
                var response = null;
                if (typeof this.bubblingListners[e] == "object" && this.bubblingListners[e].length > 0) {
                    var todelete = [];
                    for (var i = 0; i < this.bubblingListners[e].length; i++) {
                        if (this.bubblingListners[e][i] !== null) {
                            if (typeof this.bubblingListners[e][i].callback === "function") response = this.bubblingListners[e][i].callback.apply(this, args);
                            if (this.bubblingListners[e][i].once) {
                                todelete.push(i);
                            }
                            if (response === false) {
                                return response;
                            }
                        }
                    }
                    if (todelete.length > 0) for (var i in todelete) {
                        this.bubblingListners[e][todelete[i]] = null;
                    }
                }
                if (this.$parent) this.$parent.bubbling(e, args);
                return response;
            },
            bind: function(e, callback, once) {
                if (typeof this.eventListners[e] != "object") this.eventListners[e] = [];
                this.eventListners[e].push({
                    callback: callback,
                    once: once
                });
                return this;
            },
            unbind: function(e, handler) {
                if (this.eventListners[e]) {
                    if ("undefined" === typeof handler) delete this.eventListners[e]; else for (var i = 0; i < this.eventListners[e].length; ++i) {
                        if (this.eventListners[e][i] && this.surfacingListners[e][i].callback === handler) this.surfacingListners[e][i] = null;
                    }
                }
                return this;
            },
            on: function(e, callback, once) {
                if (typeof this.eventListners[e] != "object") this.eventListners[e] = [];
                this.eventListners[e].push({
                    callback: this.$inject(callback),
                    once: once || false
                });
                if ("object" === typeof this.eventTracks[e]) callback.apply(this.eventTracks[e][0], this.eventTracks[e][1]);
                return new eventListner(this, e, this.eventListners[e].length - 1);
            },
            once: function(e, callback) {
                this.bind(e, callback, true);
                return this;
            },
            trigger: function() {
                if (typeof arguments[0] == "integer") {
                    var uin = arguments[0];
                    var e = arguments[1];
                    var args = arguments.length > 2 ? arguments[2] : [];
                } else {
                    var uin = false;
                    var e = arguments[0];
                    var args = arguments.length > 1 ? arguments[1] : [];
                }
                var response = false;
                this.eventTracks[e] = [ this, args ];
                if (typeof this.eventListners[e] == "object" && this.eventListners[e].length > 0) {
                    var todelete = [];
                    for (var i = 0; i < this.eventListners[e].length; i++) {
                        if (this.eventListners[e][i] !== null) {
                            if (typeof this.eventListners[e][i].callback === "function") response = this.eventListners[e][i].callback.apply(this, args);
                            if (this.eventListners[e][i].once) {
                                todelete.push(i);
                            }
                        }
                    }
                    if (todelete.length > 0) for (var i in todelete) {
                        this.eventListners[e][todelete[i]] = null;
                    }
                }
                return response;
            },
            clearEventListners: function() {
                this.eventListners = {};
            }
        };
        return Events;
    }(smartCallback);
    var getObjectByXPath = function() {
        return function(start, xpath) {
            for (var i = 0; i < xpath.length; ++i) {
                if ("object" !== typeof start) return false;
                if ("undefined" === typeof start[xpath[i]]) return false;
                start = start[xpath[i]];
            }
            return start;
        };
    }();
    var getNonScopeValue = function() {
        return function(newValue) {
            return /^{{[^}}]*}}$/i.test(newValue) || newValue === undefined ? false : newValue;
        };
    }();
    var watch = function() {
        "use strict";
        var WatchJS = {
            noMore: false,
            useDirtyCheck: false
        }, lengthsubjects = [];
        var dirtyChecklist = [];
        var pendingChanges = [];
        var supportDefineProperty = false;
        try {
            supportDefineProperty = Object.defineProperty && Object.defineProperty({}, "x", {});
        } catch (ex) {}
        var isFunction = function(functionToCheck) {
            var getType = {};
            return functionToCheck && getType.toString.call(functionToCheck) == "[object Function]";
        };
        var isInt = function(x) {
            return x % 1 === 0;
        };
        var isArray = function(obj) {
            return Object.prototype.toString.call(obj) === "[object Array]";
        };
        var isObject = function(obj) {
            return {}.toString.apply(obj) === "[object Object]";
        };
        var getObjDiff = function(a, b) {
            var aplus = [], bplus = [];
            if (!(typeof a == "string") && !(typeof b == "string")) {
                if (isArray(a)) {
                    for (var i = 0; i < a.length; i++) {
                        if (b[i] === undefined) aplus.push(i);
                    }
                } else {
                    for (var i in a) {
                        if (a.hasOwnProperty(i)) {
                            if (b[i] === undefined) {
                                aplus.push(i);
                            }
                        }
                    }
                }
                if (isArray(b)) {
                    for (var j = 0; j < b.length; j++) {
                        if (a[j] === undefined) bplus.push(j);
                    }
                } else {
                    for (var j in b) {
                        if (b.hasOwnProperty(j)) {
                            if (a[j] === undefined) {
                                bplus.push(j);
                            }
                        }
                    }
                }
            }
            return {
                added: aplus,
                removed: bplus
            };
        };
        var clone = function(obj) {
            if (null == obj || "object" != typeof obj) {
                return obj;
            }
            var copy = obj.constructor();
            for (var attr in obj) {
                copy[attr] = obj[attr];
            }
            return copy;
        };
        var defineGetAndSet = function(obj, propName, getter, setter) {
            try {
                Object.observe(obj, function(changes) {
                    changes.forEach(function(change) {
                        if (change.name === propName) {
                            setter(change.object[change.name]);
                        }
                    });
                });
            } catch (e) {
                try {
                    Object.defineProperty(obj, propName, {
                        get: getter,
                        set: function(value) {
                            setter.call(this, value, true);
                        },
                        enumerable: true,
                        configurable: true
                    });
                } catch (e2) {
                    try {
                        Object.prototype.__defineGetter__.call(obj, propName, getter);
                        Object.prototype.__defineSetter__.call(obj, propName, function(value) {
                            setter.call(this, value, true);
                        });
                    } catch (e3) {
                        observeDirtyChanges(obj, propName, setter);
                    }
                }
            }
        };
        var defineProp = function(obj, propName, value) {
            try {
                Object.defineProperty(obj, propName, {
                    enumerable: false,
                    configurable: true,
                    writable: false,
                    value: value
                });
            } catch (error) {
                obj[propName] = value;
            }
        };
        var observeDirtyChanges = function(obj, propName, setter) {
            dirtyChecklist[dirtyChecklist.length] = {
                prop: propName,
                object: obj,
                orig: clone(obj[propName]),
                callback: setter
            };
        };
        var watch = function() {
            if (isFunction(arguments[1])) {
                watchAll.apply(this, arguments);
            } else if (isArray(arguments[1])) {
                watchMany.apply(this, arguments);
            } else {
                watchOne.apply(this, arguments);
            }
        };
        var watchAll = function(obj, watcher, level, addNRemove) {
            if (typeof obj == "string" || !(obj instanceof Object) && !isArray(obj)) {
                return;
            }
            if (isArray(obj)) {
                defineWatcher(obj, "__watchall__", watcher, level);
                if (level === undefined || level > 0) {
                    for (var prop = 0; prop < obj.length; prop++) {
                        watchAll(obj[prop], watcher, level, addNRemove);
                    }
                }
            } else {
                var prop, props = [];
                for (prop in obj) {
                    if (prop == "$val" || !supportDefineProperty && prop === "watchers") {
                        continue;
                    }
                    if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                        props.push(prop);
                    }
                }
                watchMany(obj, props, watcher, level, addNRemove);
            }
            if (addNRemove) {
                pushToLengthSubjects(obj, "$$watchlengthsubjectroot", watcher, level);
            }
        };
        var watchMany = function(obj, props, watcher, level, addNRemove) {
            if (typeof obj == "string" || !(obj instanceof Object) && !isArray(obj)) {
                return;
            }
            for (var i = 0; i < props.length; i++) {
                var prop = props[i];
                watchOne(obj, prop, watcher, level, addNRemove);
            }
        };
        var watchOne = function(obj, prop, watcher, level, addNRemove) {
            if (typeof obj == "string" || !(obj instanceof Object) && !isArray(obj)) {
                return;
            }
            if (isFunction(obj[prop])) {
                return;
            }
            if (obj[prop] != null && (level === undefined || level > 0)) {
                watchAll(obj[prop], watcher, level !== undefined ? level - 1 : level);
            }
            defineWatcher(obj, prop, watcher, level);
            if (addNRemove && (level === undefined || level > 0)) {
                pushToLengthSubjects(obj, prop, watcher, level);
            }
        };
        var unwatch = function() {
            if (isFunction(arguments[1])) {
                unwatchAll.apply(this, arguments);
            } else if (isArray(arguments[1])) {
                unwatchMany.apply(this, arguments);
            } else {
                unwatchOne.apply(this, arguments);
            }
        };
        var unwatchAll = function(obj, watcher) {
            if (obj instanceof String || !(obj instanceof Object) && !isArray(obj)) {
                return;
            }
            if (isArray(obj)) {
                var props = [ "__watchall__" ];
                for (var prop = 0; prop < obj.length; prop++) {
                    props.push(prop);
                }
                unwatchMany(obj, props, watcher);
            } else {
                var unwatchPropsInObject = function(obj2) {
                    var props = [];
                    for (var prop2 in obj2) {
                        if (obj2.hasOwnProperty(prop2)) {
                            if (obj2[prop2] instanceof Object) {
                                unwatchPropsInObject(obj2[prop2]);
                            } else {
                                props.push(prop2);
                            }
                        }
                    }
                    unwatchMany(obj2, props, watcher);
                };
                unwatchPropsInObject(obj);
            }
        };
        var unwatchMany = function(obj, props, watcher) {
            for (var prop2 in props) {
                if (props.hasOwnProperty(prop2)) {
                    unwatchOne(obj, props[prop2], watcher);
                }
            }
        };
        var timeouts = [], timerID = null;
        function clearTimerID() {
            timerID = null;
            for (var i = 0; i < timeouts.length; i++) {
                timeouts[i]();
            }
            timeouts.length = 0;
        }
        var getTimerID = function() {
            if (!timerID) {
                timerID = setTimeout(clearTimerID);
            }
            return timerID;
        };
        var registerTimeout = function(fn) {
            if (timerID == null) getTimerID();
            timeouts[timeouts.length] = fn;
        };
        var trackChange = function() {
            var fn = isFunction(arguments[2]) ? trackProperty : trackObject;
            fn.apply(this, arguments);
        };
        var trackObject = function(obj, callback, recursive, addNRemove) {
            var change = null, lastTimerID = -1;
            var isArr = isArray(obj);
            var level, fn = function(prop, action, newValue, oldValue) {
                var timerID = getTimerID();
                if (lastTimerID !== timerID) {
                    lastTimerID = timerID;
                    change = {
                        type: "update"
                    };
                    change["value"] = obj;
                    change["splices"] = null;
                    registerTimeout(function() {
                        callback.call(this, change);
                        change = null;
                    });
                }
                if (isArr && obj === this && change !== null) {
                    if (action === "pop" || action === "shift") {
                        newValue = [];
                        oldValue = [ oldValue ];
                    } else if (action === "push" || action === "unshift") {
                        newValue = [ newValue ];
                        oldValue = [];
                    } else if (action !== "splice") {
                        return;
                    }
                    if (!change.splices) change.splices = [];
                    change.splices[change.splices.length] = {
                        index: prop,
                        deleteCount: oldValue ? oldValue.length : 0,
                        addedCount: newValue ? newValue.length : 0,
                        added: newValue,
                        deleted: oldValue
                    };
                }
            };
            level = recursive == true ? undefined : 0;
            watchAll(obj, fn, level, addNRemove);
        };
        var trackProperty = function(obj, prop, callback, recursive, addNRemove) {
            if (obj && prop) {
                watchOne(obj, prop, function(prop, action, newvalue, oldvalue) {
                    var change = {
                        type: "update"
                    };
                    change["value"] = newvalue;
                    change["oldvalue"] = oldvalue;
                    if (recursive && isObject(newvalue) || isArray(newvalue)) {
                        trackObject(newvalue, callback, recursive, addNRemove);
                    }
                    callback.call(this, change);
                }, 0);
                if (recursive && isObject(obj[prop]) || isArray(obj[prop])) {
                    trackObject(obj[prop], callback, recursive, addNRemove);
                }
            }
        };
        var defineWatcher = function(obj, prop, watcher, level) {
            var newWatcher = false;
            var isArr = isArray(obj);
            if (!obj.watchers) {
                defineProp(obj, "watchers", {});
                if (isArr) {
                    watchFunctions(obj, function(index, action, newValue, oldValue) {
                        addPendingChange(obj, index, action, newValue, oldValue);
                        if (level !== 0 && newValue && (isObject(newValue) || isArray(newValue))) {
                            var i, n, ln, wAll, watchList = obj.watchers[prop];
                            if (wAll = obj.watchers["__watchall__"]) {
                                watchList = watchList ? watchList.concat(wAll) : wAll;
                            }
                            ln = watchList ? watchList.length : 0;
                            for (i = 0; i < ln; i++) {
                                if (action !== "splice") {
                                    watchAll(newValue, watchList[i], level === undefined ? level : level - 1);
                                } else {
                                    for (n = 0; n < newValue.length; n++) {
                                        watchAll(newValue[n], watchList[i], level === undefined ? level : level - 1);
                                    }
                                }
                            }
                        }
                    });
                }
            }
            if (!obj.watchers[prop]) {
                obj.watchers[prop] = [];
                if (!isArr) newWatcher = true;
            }
            for (var i = 0; i < obj.watchers[prop].length; i++) {
                if (obj.watchers[prop][i] === watcher) {
                    return;
                }
            }
            obj.watchers[prop].push(watcher);
            if (newWatcher) {
                var val = obj[prop];
                var getter = function() {
                    return val;
                };
                var setter = function(newval, delayWatcher) {
                    var oldval = val;
                    val = newval;
                    if (level !== 0 && obj[prop] && (isObject(obj[prop]) || isArray(obj[prop])) && !obj[prop].watchers) {
                        var i, ln = obj.watchers[prop].length;
                        for (i = 0; i < ln; i++) {
                            watchAll(obj[prop], obj.watchers[prop][i], level === undefined ? level : level - 1);
                        }
                    }
                    if (isSuspended(obj, prop)) {
                        resume(obj, prop);
                        return;
                    }
                    if (!WatchJS.noMore) {
                        if (oldval !== newval) {
                            if (!delayWatcher) {
                                callWatchers(obj, prop, "set", newval, oldval);
                            } else {
                                addPendingChange(obj, prop, "set", newval, oldval);
                            }
                            WatchJS.noMore = false;
                        }
                    }
                };
                if (WatchJS.useDirtyCheck) {
                    observeDirtyChanges(obj, prop, setter);
                } else {
                    defineGetAndSet(obj, prop, getter, setter);
                }
            }
        };
        var callWatchers = function(obj, prop, action, newval, oldval) {
            if (prop !== undefined) {
                var ln, wl, watchList = obj.watchers[prop];
                if (wl = obj.watchers["__watchall__"]) {
                    watchList = watchList ? watchList.concat(wl) : wl;
                }
                ln = watchList ? watchList.length : 0;
                for (var wr = 0; wr < ln; wr++) {
                    watchList[wr].call(obj, prop, action, newval, oldval);
                }
            } else {
                for (var prop in obj) {
                    if (obj.hasOwnProperty(prop)) {
                        callWatchers(obj, prop, action, newval, oldval);
                    }
                }
            }
        };
        var methodNames = [ "pop", "push", "reverse", "shift", "sort", "slice", "unshift", "splice" ];
        var defineArrayMethodWatcher = function(obj, original, methodName, callback) {
            defineProp(obj, methodName, function() {
                var index = 0;
                var i, newValue, oldValue, response;
                if (methodName === "splice") {
                    var start = arguments[0];
                    var end = start + arguments[1];
                    oldValue = obj.slice(start, end);
                    newValue = [];
                    for (i = 2; i < arguments.length; i++) {
                        newValue[i - 2] = arguments[i];
                    }
                    index = start;
                } else {
                    newValue = arguments.length > 0 ? arguments[0] : undefined;
                }
                response = original.apply(obj, arguments);
                if (methodName !== "slice") {
                    if (methodName === "pop") {
                        oldValue = response;
                        index = obj.length;
                    } else if (methodName === "push") {
                        index = obj.length - 1;
                    } else if (methodName === "shift") {
                        oldValue = response;
                    } else if (methodName !== "unshift" && newValue === undefined) {
                        newValue = response;
                    }
                    callback.call(obj, index, methodName, newValue, oldValue);
                }
                return response;
            });
        };
        var watchFunctions = function(obj, callback) {
            if (!isFunction(callback) || !obj || obj instanceof String || !isArray(obj)) {
                return;
            }
            for (var i = methodNames.length, methodName; i--; ) {
                methodName = methodNames[i];
                defineArrayMethodWatcher(obj, obj[methodName], methodName, callback);
            }
        };
        var unwatchOne = function(obj, prop, watcher) {
            if (obj.watchers[prop]) {
                if (watcher === undefined) {
                    delete obj.watchers[prop];
                } else {
                    for (var i = 0; i < obj.watchers[prop].length; i++) {
                        var w = obj.watchers[prop][i];
                        if (w == watcher) {
                            obj.watchers[prop].splice(i, 1);
                        }
                    }
                }
            }
            removeFromLengthSubjects(obj, prop, watcher);
            removeFromDirtyChecklist(obj, prop);
        };
        var suspend = function(obj, prop) {
            if (obj.watchers) {
                var name = "__wjs_suspend__" + (prop !== undefined ? prop : "");
                obj.watchers[name] = true;
            }
        };
        var isSuspended = function(obj, prop) {
            return obj.watchers && (obj.watchers["__wjs_suspend__"] || obj.watchers["__wjs_suspend__" + prop]);
        };
        var resume = function(obj, prop) {
            registerTimeout(function() {
                delete obj.watchers["__wjs_suspend__"];
                delete obj.watchers["__wjs_suspend__" + prop];
            });
        };
        var pendingTimerID = null;
        var addPendingChange = function(obj, prop, mode, newval, oldval) {
            pendingChanges[pendingChanges.length] = {
                obj: obj,
                prop: prop,
                mode: mode,
                newval: newval,
                oldval: oldval
            };
            if (pendingTimerID === null) {
                pendingTimerID = setTimeout(applyPendingChanges);
            }
        };
        var applyPendingChanges = function() {
            var change = null;
            pendingTimerID = null;
            for (var i = 0; i < pendingChanges.length; i++) {
                change = pendingChanges[i];
                callWatchers(change.obj, change.prop, change.mode, change.newval, change.oldval);
            }
            if (change) {
                pendingChanges = [];
                change = null;
            }
        };
        var loop = function() {
            for (var i = 0; i < lengthsubjects.length; i++) {
                var subj = lengthsubjects[i];
                if (subj.prop === "$$watchlengthsubjectroot") {
                    var difference = getObjDiff(subj.obj, subj.actual);
                    if (difference.added.length || difference.removed.length) {
                        if (difference.added.length) {
                            watchMany(subj.obj, difference.added, subj.watcher, subj.level - 1, true);
                        }
                        subj.watcher.call(subj.obj, "root", "differentattr", difference, subj.actual);
                    }
                    subj.actual = clone(subj.obj);
                } else {
                    var difference = getObjDiff(subj.obj[subj.prop], subj.actual);
                    if (difference.added.length || difference.removed.length) {
                        if (difference.added.length) {
                            for (var j = 0; j < subj.obj.watchers[subj.prop].length; j++) {
                                watchMany(subj.obj[subj.prop], difference.added, subj.obj.watchers[subj.prop][j], subj.level - 1, true);
                            }
                        }
                        callWatchers(subj.obj, subj.prop, "differentattr", difference, subj.actual);
                    }
                    subj.actual = clone(subj.obj[subj.prop]);
                }
            }
            var n, value;
            if (dirtyChecklist.length > 0) {
                for (var i = 0; i < dirtyChecklist.length; i++) {
                    n = dirtyChecklist[i];
                    value = n.object[n.prop];
                    if (!compareValues(n.orig, value)) {
                        n.orig = clone(value);
                        n.callback(value);
                    }
                }
            }
        };
        var compareValues = function(a, b) {
            var i, state = true;
            if (a !== b) {
                if (isObject(a)) {
                    for (i in a) {
                        if (!supportDefineProperty && i === "watchers") continue;
                        if (a[i] !== b[i]) {
                            state = false;
                            break;
                        }
                    }
                } else {
                    state = false;
                }
            }
            return state;
        };
        var pushToLengthSubjects = function(obj, prop, watcher, level) {
            var actual;
            if (prop === "$$watchlengthsubjectroot") {
                actual = clone(obj);
            } else {
                actual = clone(obj[prop]);
            }
            lengthsubjects.push({
                obj: obj,
                prop: prop,
                actual: actual,
                watcher: watcher,
                level: level
            });
        };
        var removeFromLengthSubjects = function(obj, prop, watcher) {
            for (var i = 0; i < lengthsubjects.length; i++) {
                var subj = lengthsubjects[i];
                if (subj.obj == obj && subj.prop == prop && subj.watcher == watcher) {
                    lengthsubjects.splice(i, 1);
                }
            }
        };
        var removeFromDirtyChecklist = function(obj, prop) {
            var notInUse;
            for (var i = 0; i < dirtyChecklist.length; i++) {
                var n = dirtyChecklist[i];
                var watchers = n.object.watchers;
                notInUse = n.object == obj && n.prop == prop && watchers && (!watchers[prop] || watchers[prop].length == 0);
                if (notInUse) {
                    dirtyChecklist.splice(i, 1);
                }
            }
        };
        setInterval(loop, 50);
        WatchJS.watch = watch;
        WatchJS.unwatch = unwatch;
        WatchJS.callWatchers = callWatchers;
        WatchJS.suspend = suspend;
        WatchJS.onChange = trackChange;
        return WatchJS;
    }();
    var min = function(getObjectByXPath) {
        var each = function(subject, fn) {
            for (var prop in subject) {
                if (subject.hasOwnProperty(prop)) {
                    fn.call(subject, subject[prop], prop);
                }
            }
        }, regPlaceholder = /\{\{([^\} ]*)\}\}/gi;
        return function(tpl, data, preProcessor, postProcessor) {
            var template = tpl, matches = template.match(regPlaceholder);
            if (matches !== null) matches.forEach(function(dph) {
                regPlaceholder.lastIndex = 0;
                var placeholderData = regPlaceholder.exec(dph), placeholder = placeholderData[1];
                template = template.replace(dph, getObjectByXPath(data, placeholder.split(".")));
            });
            return template;
        };
    }(getObjectByXPath);
    var modulePrototype = function() {
        return function() {
            console.debug("DEBUG ME: because im starting after module initialization. This is very baaad.");
        }.proto({
            $apply: function(cb) {
                return this.$.$apply(cb);
            },
            $hitch: function(cb) {
                var fkey = cb.toString();
                if ("function" === typeof this.$hitchers[fkey]) this.$hitchers[fkey].call(this);
                this.$hitchers[fkey] = this.$.$run(cb);
                return function(i) {
                    this.$hitchers[i].call(this);
                    delete this.$hitchers[i];
                }.bind(this, fkey);
            },
            $destroy: function() {
                for (var i in this.$hitchers) {
                    if (this.$hitchers.hasOwnProperty(i) && "function" === typeof this.$hitchers[i]) {
                        this.$hitchers[i].call(this);
                    }
                }
            }
        });
    }();
    var scopeUtilits = function() {
        return function($) {
            this.$ = $;
        }.proto({
            toggleAppend: function(collection, value, force) {
                this.$.$apply(function() {
                    if ("boolean" !== typeof force) force = !~collection.indexOf(value);
                    if (force) {
                        collection.push(value);
                    } else {
                        collection.splice(collection.indexOf(value), 1);
                    }
                });
            }
        });
    }();
    var WebElementPrototype = function(getObjectByXPath, watchJS, smartCallback, classEvents, camelize, getNonScopeValue) {
        return function() {
            this.$watchersHistory = [];
            this.$applyLeaders = {};
            this.$hitchers = {};
        }.inherit(classEvents).proto({
            $read: function() {
                if (this.__config__.allWaitingForResolve) {
                    this.$queue(function(args) {
                        this.read.apply(this, args);
                    }.bind(this, arguments));
                    return;
                }
                var self = this, objectXPath = false, properties, callback;
                arguments.length > 2 ? (objectXPath = arguments[0], 
                properties = arguments[1], callback = arguments[2]) : (properties = arguments[0], 
                callback = arguments[1]);
                var xpath = objectXPath ? objectXPath.split(".") : [];
                var requiredProperties = [];
                if ("object" !== typeof properties) properties = [ properties ];
                for (var i = 0; i < properties.length; ++i) {
                    requiredProperties.push(xpath.concat(properties[i].split(".")));
                }
                var alldata = [];
                if (self.$injectors.$component.options.engine.name === "angular" && Synthetic.$$angularApp) {
                    for (var x = 0; x < requiredProperties.length; ++x) {
                        alldata.push(getNonScopeValue(self.$injectors.$scope.$eval(requiredProperties[x].join("."))));
                    }
                } else {
                    for (var x = 0; x < requiredProperties.length; ++x) {
                        alldata.push(getNonScopeValue(getObjectByXPath(self.$injectors.$scope, requiredProperties[x])));
                    }
                }
                var jstr = JSON.stringify(alldata), rstr = JSON.stringify(requiredProperties);
                if (self.$scopeSnaps[rstr] && jstr === self.$scopeSnaps[rstr]) {
                    return;
                }
                self.$scopeSnaps[rstr] = jstr;
                self.$inject(callback).apply(self, alldata);
            },
            $watch: function() {
                if (this.__config__.allWaitingForResolve) {
                    this.$queue(function(args) {
                        this.watch.apply(this, args);
                    }.bind(this, arguments));
                    return;
                }
                var self = this, objectXPath = false, properties, callback;
                arguments.length > 2 ? (objectXPath = arguments[0], 
                properties = arguments[1], callback = arguments[2]) : (properties = arguments[0], 
                callback = arguments[1]);
                if (!(properties instanceof Array)) properties = [ properties ];
                var xpath = objectXPath ? objectXPath.split(".") : [];
                var requiredProperties = [];
                for (var i = 0; i < properties.length; ++i) {
                    requiredProperties.push(xpath.concat(properties[i].split(".")));
                }
                var lastTrack = {};
                if (this.__config__.rendered) this.$read.apply(this, Array.prototype.slice.apply(arguments));
                var getDatas = function(requiredProperties, rprops) {
                    return function(prop, action, newValue) {
                        var alldata = [];
                        for (var x = 0; x < requiredProperties.length; ++x) {
                            if (rprops === requiredProperties[x]) {
                                alldata.push(getNonScopeValue(newValue));
                            } else {
                                if (self.$injectors.$component.options.engine.name === "angular" && Synthetic.$$angularApp) {
                                    alldata.push(getNonScopeValue(self.$injectors.$scope.$eval(requiredProperties[x].join("."))));
                                } else {
                                    alldata.push(getNonScopeValue(getObjectByXPath(self.$injectors.$scope, requiredProperties[x])));
                                }
                            }
                        }
                        var jstr = JSON.stringify(alldata), rstr = JSON.stringify(requiredProperties);
                        if (self.$scopeSnaps[rstr] && jstr === self.$scopeSnaps[rstr]) {
                            return;
                        }
                        self.$scopeSnaps[rstr] = jstr;
                        self.$inject(callback).apply(self, alldata);
                    };
                };
                var watchFabric = function(rprops, wobject, prop) {
                    if ("undefined" === typeof wobject[prop]) wobject[prop] = false;
                    self.$scopeSnaps[JSON.stringify(requiredProperties)] = false;
                    if (self.$injectors.$component.options.engine.name === "angular" && Synthetic.$$angularApp) {
                        var compiledCallbacker = getDatas(requiredProperties, rprops);
                        try {
                            var unwatcher = self.$injectors.$scope.$watch(rprops.join("."), function(newValue) {
                                this.call(self, false, "set", newValue);
                            }.bind(compiledCallbacker));
                            if (rprops[0] === "properties" || rprops[0] === "attributes") {
                                var attrn = rprops[0] === "properties" ? "data" + rprops[1].charAt(0).toUpperCase() + rprops[1].substr(1) : rprops[1];
                                if ("object" !== typeof self.$$attrsWatchers[attrn]) self.$$attrsWatchers[attrn] = [];
                                self.$$attrsWatchers[attrn].push(compiledCallbacker);
                                self.$watchersHistory.push({
                                    unwatch: function(i) {
                                        this[i] = null;
                                    }.bind(self.$$attrsWatchers[attrn], self.$$attrsWatchers[attrn].length - 1)
                                });
                            }
                            self.$watchersHistory.push({
                                unwatch: unwatcher
                            });
                        } catch (e) {
                            window.teste = self.$injectors.$element;
                            console.error("Errors", e, rprops, wobject, self.$injectors.$element);
                        }
                        return unwatcher;
                    } else {
                        var watchi = {
                            object: wobject,
                            property: prop,
                            callback: getDatas(requiredProperties, rprops)
                        };
                        var unwatcher = function() {
                            watchJS.unwatch(this.object, this.prop, this.callback);
                        }.bind(watchi);
                        self.$watchersHistory.push({
                            unwatch: unwatcher
                        });
                        watchJS.watch(watchi.object, watchi.property, watchi.callback);
                        return unwatcher;
                    }
                };
                var unwacthers = function() {
                    "empty unwatcher";
                };
                for (var i = 0; i < requiredProperties.length; ++i) {
                    unwacthers = unwacthers.inherit(watchFabric(requiredProperties[i], getObjectByXPath(this.$injectors.$scope, requiredProperties[i].slice(0, requiredProperties[i].length - 1)), requiredProperties[i][requiredProperties[i].length - 1]));
                }
                return unwacthers;
            },
            $inject: function(callback) {
                if (Synthetic.$$angularApp && this.__config__.$$angularScope && this.__config__.$$angularInitialedStage > 1) {
                    var self = this;
                    return function() {
                        var nargs = Array.prototype.slice.apply(arguments), context = this;
                        return smartCallback.call(self.$injectors, callback, self).apply(context, nargs);
                    };
                } else {
                    return smartCallback.call(this.$injectors, callback, this);
                }
            },
            $run: function(cb) {
                return this.$inject(cb)();
            },
            $queue: function(callback) {
                var self = this;
                if (this.__config__.allWaitingForResolve) {
                    this.bind(this.__config__.allWaitingForResolve, function() {
                        if (self.$destroyed) return false;
                        callback.apply(this, arguments);
                    });
                } else {
                    callback.apply(this);
                }
                return this;
            },
            $apply: function($as, callback, destructor) {
                arguments.length === 1 && (callback = $as, $as = false, 
                destructor = false);
                if ($as) {
                    if (this.$applyLeaders[$as]) {
                        this.$applyLeaders[$as]();
                    }
                    var allowApply = true, component = this, allowDestructor = function() {
                        allowApply = false;
                        delete component.$applyLeaders[$as];
                        if ("function" === typeof destructor) destructor();
                    }, boundApply = this.$inject(callback), realCallback = function() {
                        if (allowApply) {
                            delete component.$applyLeaders[$as];
                            return boundApply();
                        }
                        return false;
                    };
                    this.$applyLeaders[$as] = allowDestructor;
                } else {
                    var realCallback = this.$inject(callback);
                }
                if (this.$injectors.$component.options.engine.name === "angular" && Synthetic.$$angularApp) Synthetic.$$angularTimeout(realCallback); else setTimeout(realCallback);
            },
            $template: function(content) {
                this.$injectors.$generator.template(content);
                return this;
            },
            $destroy: function() {
                if (this.$destroyed) return true;
                this.trigger("$destroy");
                this.$destroyed = true;
                if (this.$parent) {
                    this.$parent.$$unRegisterChild(this);
                }
                if ("function" === typeof this.destroy) {
                    this.destroy();
                }
                this.clearEventListners();
                for (var i = 0; i < this.$watchersHistory.length; ++i) {
                    if (this.$watchersHistory[i] !== null) {
                        this.$watchersHistory[i].unwatch();
                    }
                }
                for (var i in this.$hitchers) {
                    if (this.$hitchers.hasOwnProperty(i) && "function" === typeof this.$hitchers[i]) {
                        this.$hitchers[i].call(this);
                    }
                }
                this.$injectors.$generator.destroy();
                this.$injectors.$generator = null;
                this.$element.synthetic = null;
                this.__config__ = {};
                if (this.$element && this.$element.parentNode !== null) {
                    this.$element.remove();
                }
            },
            $hitch: function(cb) {
                var fkey = cb.toString();
                if ("function" === typeof this.$hitchers[fkey]) this.$hitchers[fkey].call(this);
                this.$hitchers[fkey] = this.$run(cb);
                return function(i) {
                    this.$hitchers[i].call(this);
                    delete this.$hitchers[i];
                }.bind(this, fkey);
            },
            $$registerChild: function($ctrl) {
                this.$childs[$ctrl.$sid] = $ctrl;
                return this;
            },
            $$unRegisterChild: function($ctrl) {
                if (this.$childs[$ctrl.$sid]) {
                    delete this.$childs[$ctrl.$sid];
                }
                return this;
            }
        });
    }(getObjectByXPath, watch, smartCallback, classEvents, camelize, getNonScopeValue);
    var extend = function() {
        var hasOwn = Object.prototype.hasOwnProperty;
        var toStr = Object.prototype.toString;
        var isArray = function isArray(arr) {
            if (typeof Array.isArray === "function") {
                return Array.isArray(arr);
            }
            return toStr.call(arr) === "[object Array]";
        };
        var isPlainObject = function isPlainObject(obj) {
            "use strict";
            if (!obj || toStr.call(obj) !== "[object Object]") {
                return false;
            }
            var has_own_constructor = hasOwn.call(obj, "constructor");
            var has_is_property_of_method = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, "isPrototypeOf");
            if (obj.constructor && !has_own_constructor && !has_is_property_of_method) {
                return false;
            }
            var key;
            for (key in obj) {}
            return typeof key === "undefined" || hasOwn.call(obj, key);
        };
        return function extend() {
            "use strict";
            var options, name, src, copy, copyIsArray, clone, target = arguments[0], i = 1, length = arguments.length, deep = false;
            if (typeof target === "boolean") {
                deep = target;
                target = arguments[1] || {};
                i = 2;
            } else if (typeof target !== "object" && typeof target !== "function" || target == null) {
                target = {};
            }
            for (;i < length; ++i) {
                options = arguments[i];
                if (options != null) {
                    for (name in options) {
                        src = target[name];
                        copy = options[name];
                        if (target !== copy) {
                            if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
                                if (copyIsArray) {
                                    copyIsArray = false;
                                    clone = src && isArray(src) ? src : [];
                                } else {
                                    clone = src && isPlainObject(src) ? src : {};
                                }
                                if (copy.constructor.name !== "Ref") target[name] = extend(deep, clone, copy);
                            } else if (typeof copy !== "undefined") {
                                target[name] = copy;
                            }
                        }
                    }
                }
            }
            return target;
        };
    }();
    var generator = function(classEvents, minTemplate, synthetModule) {
        return function(synthet) {
            this.$ = synthet;
            this.configuration = {
                template: false
            };
            this.watchers = [];
            this.$.on("angularResolved", function() {
                var $ = this;
                try {
                    this.watchers.push(angular.element(synthet.$injectors.$element).scope().$watch(function() {
                        $.trigger("DOMChanged");
                    }));
                } catch (e) {}
            });
        }.inherit(classEvents).proto({
            $inject: function(callback) {
                return this.$.$inject(callback);
            },
            template: function(template, module) {
                this.configuration.template = template;
                this.configuration.module = "function" === typeof module ? module : false;
                this.render();
            },
            render: function(template, module, args) {
                var $ = this;
                if (template) this.configuration.template = template;
                this.configuration.module = "function" === typeof module ? module : false;
                if (this.$.__config__.$$angularInitialedStage > 1) {
                    this.$inject(function($self, template, module) {
                        var test = Synthetic.$$angularCompile(template, undefined, undefined)($self.__config__.$$angularScope);
                        $self.__config__.$$angularElement.empty().append(test);
                        $self.__config__.$$angularScope.$digest();
                        $.$.trigger("rendered");
                        $.$.bubbling("shake");
                        if (module) {
                            $.setup(module, args);
                        }
                    })(this.configuration.template, this.configuration.module);
                } else {
                    this.$.$injectors.$element.innerHTML = this.$.$injectors.$element.innerHTML = minTemplate(this.configuration.template, this.$.$injectors.$scope);
                    if (this.configuration.module) {
                        $.setup(this.configuration.module);
                    }
                    this.$.trigger("rendered");
                    this.$.bubbling("shake");
                }
            },
            setup: function(module, args) {
                var $synthet = this.$;
                if ("object" === typeof this.$.module && "function" === typeof this.$.module.$destroy) {
                    this.$.module.$destroy();
                }
                var init = function() {
                    this.$ = $synthet;
                    this.$controller = $synthet;
                };
                var nm = function() {}.inherit(synthetModule).inherit(module).inherit(init);
                if ("function" === typeof this.$.__config__.templateModulePrototype) {
                    nm = nm.inherit(this.$.__config__.templateModulePrototype);
                } else if ("object" === typeof this.$.__config__.templateModulePrototype) {
                    var overMod = function() {}.proto(this.$.__config__.templateModulePrototype);
                    nm = nm.inherit(overMod);
                }
                if (args) {
                    this.$.module = nm.construct(args);
                } else {
                    this.$.module = new nm();
                }
            },
            destroy: function() {
                if ("object" === typeof this.$.module && "function" === typeof this.$.module.destory) {
                    this.$.module.destory();
                }
                if ("object" === typeof this.$.module && "function" === typeof this.$.module.$destroy) {
                    this.$.module.$destroy();
                }
                this.$.module = null;
                for (var i = 0; i < this.watchers.length; ++i) {
                    his.watchers[i]();
                }
                this.clearEventListners();
            }
        });
    }(classEvents, min, modulePrototype);
    var inherit2 = function(mixin) {
        return function(aClass, classes) {
            if (!(classes instanceof Array)) classes = [ classes ];
            var cl = classes.length;
            var superconstructor = function() {
                var args = Array.prototype.slice.apply(arguments);
                if ("object" !== typeof this.constructors) Object.defineProperty(this, "constructors", {
                    configurable: false,
                    enumerable: false,
                    writable: false,
                    value: []
                });
                for (var i = 0; i < cl; ++i) {
                    if (this.constructors.indexOf(classes[i]) >= 0) continue;
                    this.constructors.push(classes[i]);
                    classes[i].apply(this, args);
                }
            }, superprototype = superconstructor.prototype = {};
            if (aClass.prototype && aClass.prototype !== null && aClass.prototype.__super__) mixin(superprototype, aClass.prototype.__super__);
            for (var i = 0; i < cl; ++i) {
                if (classes[i].prototype) {
                    if (classes[i].prototype.__super__) superprototype = mixin(superprototype, classes[i].prototype.__super__);
                    superprototype = mixin(superprototype, classes[i].prototype);
                }
            }
            superprototype.constructor = superconstructor;
            var Mixin = function() {
                if (this.constructor && this.constructor.__disableContructor__) {
                    console.log("ESCAPE CONSTRUCTOR");
                    this.constructor.__disableContructor__ = false;
                    return false;
                }
                var args = Array.prototype.slice.apply(arguments);
                if (!(this === window)) {
                    superconstructor.apply(this, args);
                }
                aClass.apply(this, args);
            };
            Mixin.prototype = Object.create(superprototype, {
                __super__: {
                    configurable: false,
                    enumerable: false,
                    writable: false,
                    value: superprototype
                }
            });
            if (aClass.prototype) mixin(Mixin.prototype, aClass.prototype);
            for (var prop in aClass) {
                if (aClass.hasOwnProperty(prop)) Mixin[prop] = aClass[prop];
            }
            Object.defineProperty(Mixin.prototype, "constructor", {
                configurable: false,
                enumerable: false,
                writable: false,
                value: Mixin
            });
            if (!Mixin.prototype.__proto__) {
                Mixin.prototype.__proto__ = Mixin.prototype;
            }
            return Mixin;
        };
    }(mixin2);
    var templateManager = function() {}.proto({});
    var preFactory = function(mixin) {
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
        };
        preFactory.prototype = {
            constructor: preFactory,
            $addConceivedMethod: function(fn, args) {
                this.conceivedCallers.push([ fn, args ]);
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
                return this;
            },
            construct: function(c) {
                this.constructors.push(c);
                return this;
            },
            template: function() {
                this.$addConceivedMethod("template", arguments);
                return this;
            },
            config: function(useroptions) {
                this.options = mixin(this.options, useroptions);
                return this;
            }
        };
        return preFactory;
    }(mixin2);
    var initAngular = function() {
        return function() {
            Synthetic.$$angularApp = angular.module("syntheticApp", [], function() {}.bind(this));
            Synthetic.trigger("angularModuleInitialed", [ Synthetic.$$angularApp ]);
            Synthetic.$$angularApp.config(function($controllerProvider, $provide, $compileProvider) {
                Synthetic.$$angularApp._controller = Synthetic.$$angularApp.controller;
                Synthetic.$$angularApp._service = Synthetic.$$angularApp.service;
                Synthetic.$$angularApp._factory = Synthetic.$$angularApp.factory;
                Synthetic.$$angularApp._value = Synthetic.$$angularApp.value;
                Synthetic.$$angularApp._directive = Synthetic.$$angularApp.directive;
                Synthetic.$$angularApp.controller = function(name, constructor) {
                    $controllerProvider.register(name, constructor);
                    return this;
                };
                Synthetic.$$angularApp.service = function(name, constructor) {
                    $provide.service(name, constructor);
                    return this;
                };
                Synthetic.$$angularApp.factory = function(name, factory) {
                    $provide.factory(name, factory);
                    return this;
                };
                Synthetic.$$angularApp.value = function(name, value) {
                    $provide.value(name, value);
                    return this;
                };
                Synthetic.$$angularApp.directive = function(name, factory) {
                    $compileProvider.directive(name, factory);
                    return this;
                };
            }).run(function($rootScope, $compile, $q, $timeout) {
                Synthetic.$$angularRootScope = $rootScope;
                Synthetic.$$angularRCompile = $compile;
                Synthetic.$$angularCompile = $compile;
                Synthetic.$$angularQ = $q;
                Synthetic.$$angularTimeout = $timeout;
            });
            if ("object" !== typeof angular.element(document.body).injector()) {
                Synthetic.$$angularApp.controller("syntheticController", function($element, $scope) {});
                document.body.setAttribute("ng-jq", "");
                document.body.setAttribute("ng-controller", "syntheticController");
                angular.element(document.body).ready(function() {
                    setTimeout(function() {
                        angular.bootstrap(document.body, [ "syntheticApp" ]);
                        Synthetic.$$angularBootstraped = true;
                        Synthetic.trigger("angularBootstraped");
                    }, 100);
                }.bind(this));
            }
        };
    }();
    var scopeGenerator = function(mixin, camelize, scopeUtilits) {
        return function($self, $$scope, $attrs) {
            if ($self.$destroyed) return false;
            angular.extend($$scope, $self.$$scope);
            $$scope._ = new scopeUtilits($self);
            Object.defineProperty($$scope, "$module", {
                enumerable: false,
                cofigurable: false,
                editable: false,
                get: function() {
                    return $self.module;
                },
                set: function() {
                    return false;
                }
            });
            Object.defineProperty($$scope, "$synth", {
                enumerable: false,
                cofigurable: false,
                editable: false,
                get: function() {
                    return $self;
                },
                set: function() {
                    return false;
                }
            });
            $$scope.$sid = $self.$sid;
            $self.$injectors.$scope = $$scope;
            $self.__config__.allWaitingForResolve = false;
            $self.__config__.$$angularElement = angular.element($self.$element);
            $self.__config__.$$angularScope = $$scope;
            $self.__config__.$$angularInitialedStage = 2;
            $self.trigger("angularResolved");
            Object.defineProperty($self, "$$angular", {
                enumerable: false,
                writable: false,
                configurable: false,
                value: Synthetic.$$angularApp
            });
        };
    }(mixin2, camelize, scopeUtilits);
    var webElementFactory = function(WebElementPrototype, mixin, extend, Generator, camelize, getNonScopeValue) {
        return function(element, component) {
            this.$sid = "sid" + new Date().getTime() + Math.round(Math.random() * 1e7);
            if (component.options.engine.name === "angular") {
                element.setAttribute("sid", this.$sid);
                this.$$attrsWatchers = {};
            }
            Synthetic.$$lastElementFactory = this;
            this.$parent = false;
            this.$childs = {};
            this.$scopeSnaps = {};
            this.$element = element;
            this.component = component;
            Object.defineProperty(element, "synthetic", {
                enumerable: false,
                writable: false,
                configurable: false,
                value: this
            });
            Object.defineProperty(this, "__config__", {
                enumerable: false,
                writable: false,
                configurable: true,
                value: mixin({
                    allWaitingForResolve: false,
                    generator: false,
                    $$angularInitialedStage: 0,
                    $$angularDirectived: false,
                    createdEventFires: false,
                    attachedEventFires: false,
                    templateModulePrototype: false,
                    rendered: false
                }, component.options)
            });
            this.$$scope = {
                attributes: {},
                properties: {},
                $shadowTemplate: null,
                uid: "syntheticElement" + Math.round(Math.random() * 1e4)
            };
            Object.defineProperty(this, "$scope", {
                enumberable: true,
                get: function() {
                    return this.$injectors.$scope;
                }.bind(this)
            });
            Object.defineProperty(this, "$injectors", {
                enumerable: false,
                writable: false,
                configurable: true,
                value: {
                    $scope: this.$$scope,
                    $element: element,
                    $self: this,
                    $component: component,
                    $generator: new Generator(this)
                }
            });
            if ("object" === typeof angular && angular.bootstrap && component.options.engine.name === "angular") {
                var $self = this;
                this.__config__.$$angularInitialedStage = 1;
                this.__config__.allWaitingForResolve = "angularResolved";
                if (Synthetic.$$angularBootstraped) Synthetic.$$angularTimeout(function() {
                    if ($self.$destroyed) return;
                    if (!$self.__config__.$$angularDirectived && $self.__config__.$$angularInitialedStage < 2) {
                        try {
                            Synthetic.$$angularCompile($self.$element)(angular.element($self.$element).scope());
                        } catch (e) {
                            try {
                                Synthetic.$$angularCompile($self.$element)(Synthetic.$$angularRootScope.$new());
                            } catch (e) {
                                console.error("damn", e, $self.$element);
                            }
                        }
                    }
                });
            }
            for (var i = 0; i < element.childNodes.length; ++i) {
                if (element.childNodes[i].nodeType === 1) {
                    if (element.childNodes[i].tagName.toLowerCase() === "script" && regSyntheticScript.test(element.childNodes[i].innerHTML)) {
                        (function(content) {
                            var userfunc, Synthetic = function(callback) {
                                userfunc = callback;
                            };
                            try {
                                eval(content);
                            } catch (e) {
                                console.error("Syntehtic: user func corrupt;", content, e);
                                return;
                            }
                            this.$queue(this.$inject(userfunc));
                        }).call(this, element.childNodes[i].innerHTML);
                    } else {}
                } else if (element.childNodes[i].nodeType === 8) {
                    var nv = element.childNodes[i].nodeValue.trim();
                    if (nv.substr(0, 9) === "template:") {
                        this.$$scope.$shadowTemplate = nv.substr(9);
                    }
                }
            }
            this.$queue(function() {
                var pe = this.$element.parentNode;
                while (!(pe === null || "undefined" !== typeof pe.synthetic)) {
                    pe = pe.parentNode;
                }
                this.$parent = pe !== null && "object" === typeof pe.synthetic ? pe.synthetic : false;
                if (this.$parent) {
                    this.$parent.$$registerChild(this);
                    this.trigger("parentDefined");
                }
                if (!~this.$element.className.split(" ").indexOf("synt-loaded")) this.$element.className += " synt-loaded";
                for (var z = 0; z < element.attributes.length; z++) {
                    var value = getNonScopeValue(element.attributes[z].value);
                    this.$injectors.$scope.attributes[camelize(element.attributes[z].name)] = value;
                    if (element.attributes[z].name.substr(0, 5) === "data-") {
                        this.$injectors.$scope.properties[camelize(element.attributes[z].name.substr(5))] = value;
                    }
                }
                for (var i = 0; i < component.prototypes.length; ++i) {
                    for (var p in component.prototypes[i]) {
                        if (component.prototypes[i].hasOwnProperty(p)) {
                            this[p] = this.$inject(component.prototypes[i][p]);
                        }
                    }
                }
                this.trigger("created", [ this.element ]);
                this.__config__.createdEventFires = true;
                for (var i = 0; i < component.conceivedCallers.length; ++i) {
                    this[component.conceivedCallers[i][0]].apply(this, component.conceivedCallers[i][1]);
                }
                if (this.__config__.createdEventFires) {
                    for (var i = 0; i < component.onCreatedCallbacks.length; ++i) {
                        this.$inject(component.onCreatedCallbacks[i])();
                    }
                } else {
                    for (var i = 0; i < component.onCreatedCallbacks.length; ++i) {
                        this.on("created", component.onCreatedCallbacks[i]);
                    }
                }
                if (this.__config__.attachedEventFires) {
                    for (var i = 0; i < component.onAttachedCallbacks.length; ++i) {
                        this.$inject(component.onAttachedCallbacks[i])();
                    }
                } else {
                    for (var i = 0; i < component.onAttachedCallbacks.length; ++i) {
                        this.on("attached", component.onAttachedCallbacks[i]);
                    }
                }
                for (var i = 0; i < component.onDetachedCallbacks.length; ++i) {
                    this.on("detached", component.onDetachedCallbacks[i]);
                }
                for (var i = 0; i < component.onAttributeChangedCallbacks.length; ++i) {
                    this.on("attributeChanged", component.onAttributeChangedCallbacks[i]);
                }
                var evalWatchers = function() {
                    for (var i = 0; i < component.watchers.length; ++i) {
                        this.$watch.apply(this, component.watchers[i]);
                    }
                    for (var i = 0; i < component.watchers.length; ++i) {
                        this.$read.apply(this, component.watchers[i]);
                    }
                };
                if (!this.$parent) {
                    this.bind("parentDefined", function() {
                        evalWatchers.call(this);
                    }, true);
                } else {
                    evalWatchers.call(this);
                }
                this.trigger("rendered", [ this.$element ]);
                this.__config__.rendered = true;
                this.bubbling("shake");
            });
        }.inherit(WebElementPrototype);
    }(WebElementPrototype, mixin2, extend, generator, camelize, getNonScopeValue);
    (function() {
        (function(window, document, Object, REGISTER_ELEMENT) {
            "use strict";
            if (REGISTER_ELEMENT in document) return;
            var EXPANDO_UID = "__" + REGISTER_ELEMENT + (Math.random() * 1e5 >> 0), ATTACHED = "attached", DETACHED = "detached", EXTENDS = "extends", ADDITION = "ADDITION", MODIFICATION = "MODIFICATION", REMOVAL = "REMOVAL", DOM_ATTR_MODIFIED = "DOMAttrModified", DOM_CONTENT_LOADED = "DOMContentLoaded", DOM_SUBTREE_MODIFIED = "DOMSubtreeModified", PREFIX_TAG = "<", PREFIX_IS = "=", validName = /^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+$/, invalidNames = [ "ANNOTATION-XML", "COLOR-PROFILE", "FONT-FACE", "FONT-FACE-SRC", "FONT-FACE-URI", "FONT-FACE-FORMAT", "FONT-FACE-NAME", "MISSING-GLYPH" ], types = [], protos = [], query = "", documentElement = document.documentElement, indexOf = types.indexOf || function(v) {
                for (var i = this.length; i-- && this[i] !== v; ) {}
                return i;
            }, OP = Object.prototype, hOP = OP.hasOwnProperty, iPO = OP.isPrototypeOf, defineProperty = Object.defineProperty, gOPD = Object.getOwnPropertyDescriptor, gOPN = Object.getOwnPropertyNames, gPO = Object.getPrototypeOf, sPO = Object.setPrototypeOf, hasProto = !!Object.__proto__, create = Object.create || function Bridge(proto) {
                return proto ? (Bridge.prototype = proto, new Bridge()) : this;
            }, setPrototype = sPO || (hasProto ? function(o, p) {
                o.__proto__ = p;
                return o;
            } : gOPN && gOPD ? function() {
                function setProperties(o, p) {
                    for (var key, names = gOPN(p), i = 0, length = names.length; i < length; i++) {
                        key = names[i];
                        if (!hOP.call(o, key)) {
                            defineProperty(o, key, gOPD(p, key));
                        }
                    }
                }
                return function(o, p) {
                    do {
                        setProperties(o, p);
                    } while ((p = gPO(p)) && !iPO.call(p, o));
                    return o;
                };
            }() : function(o, p) {
                for (var key in p) {
                    o[key] = p[key];
                }
                return o;
            }), MutationObserver = window.MutationObserver || window.WebKitMutationObserver, HTMLElementPrototype = (window.HTMLElement || window.Element || window.Node).prototype, IE8 = !iPO.call(HTMLElementPrototype, documentElement), isValidNode = IE8 ? function(node) {
                return node.nodeType === 1;
            } : function(node) {
                return iPO.call(HTMLElementPrototype, node);
            }, targets = IE8 && [], cloneNode = HTMLElementPrototype.cloneNode, setAttribute = HTMLElementPrototype.setAttribute, removeAttribute = HTMLElementPrototype.removeAttribute, createElement = document.createElement, attributesObserver = MutationObserver && {
                attributes: true,
                characterData: true,
                attributeOldValue: true
            }, DOMAttrModified = MutationObserver || function(e) {
                doesNotSupportDOMAttrModified = false;
                documentElement.removeEventListener(DOM_ATTR_MODIFIED, DOMAttrModified);
            }, asapQueue, rAF = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || function(fn) {
                setTimeout(fn, 10);
            }, setListener = false, doesNotSupportDOMAttrModified = true, dropDomContentLoaded = true, notFromInnerHTMLHelper = true, onSubtreeModified, callDOMAttrModified, getAttributesMirror, observer, patchIfNotAlready, patch;
            if (sPO || hasProto) {
                patchIfNotAlready = function(node, proto) {
                    if (!iPO.call(proto, node)) {
                        setupNode(node, proto);
                    }
                };
                patch = setupNode;
            } else {
                patchIfNotAlready = function(node, proto) {
                    if (!node[EXPANDO_UID]) {
                        node[EXPANDO_UID] = Object(true);
                        setupNode(node, proto);
                    }
                };
                patch = patchIfNotAlready;
            }
            if (IE8) {
                doesNotSupportDOMAttrModified = false;
                (function() {
                    var descriptor = gOPD(HTMLElementPrototype, "addEventListener"), addEventListener = descriptor.value, patchedRemoveAttribute = function(name) {
                        var e = new CustomEvent(DOM_ATTR_MODIFIED, {
                            bubbles: true
                        });
                        e.attrName = name;
                        e.prevValue = this.getAttribute(name);
                        e.newValue = null;
                        e[REMOVAL] = e.attrChange = 2;
                        removeAttribute.call(this, name);
                        this.dispatchEvent(e);
                    }, patchedSetAttribute = function(name, value) {
                        var had = this.hasAttribute(name), old = had && this.getAttribute(name), e = new CustomEvent(DOM_ATTR_MODIFIED, {
                            bubbles: true
                        });
                        setAttribute.call(this, name, value);
                        e.attrName = name;
                        e.prevValue = had ? old : null;
                        e.newValue = value;
                        if (had) {
                            e[MODIFICATION] = e.attrChange = 1;
                        } else {
                            e[ADDITION] = e.attrChange = 0;
                        }
                        this.dispatchEvent(e);
                    }, onPropertyChange = function(e) {
                        var node = e.currentTarget, superSecret = node[EXPANDO_UID], propertyName = e.propertyName, event;
                        if (superSecret.hasOwnProperty(propertyName)) {
                            superSecret = superSecret[propertyName];
                            event = new CustomEvent(DOM_ATTR_MODIFIED, {
                                bubbles: true
                            });
                            event.attrName = superSecret.name;
                            event.prevValue = superSecret.value || null;
                            event.newValue = superSecret.value = node[propertyName] || null;
                            if (event.prevValue == null) {
                                event[ADDITION] = event.attrChange = 0;
                            } else {
                                event[MODIFICATION] = event.attrChange = 1;
                            }
                            node.dispatchEvent(event);
                        }
                    };
                    descriptor.value = function(type, handler, capture) {
                        if (type === DOM_ATTR_MODIFIED && this.attributeChangedCallback && this.setAttribute !== patchedSetAttribute) {
                            this[EXPANDO_UID] = {
                                className: {
                                    name: "class",
                                    value: this.className
                                }
                            };
                            this.setAttribute = patchedSetAttribute;
                            this.removeAttribute = patchedRemoveAttribute;
                            addEventListener.call(this, "propertychange", onPropertyChange);
                        }
                        addEventListener.call(this, type, handler, capture);
                    };
                    defineProperty(HTMLElementPrototype, "addEventListener", descriptor);
                })();
            } else if (!MutationObserver) {
                documentElement.addEventListener(DOM_ATTR_MODIFIED, DOMAttrModified);
                documentElement.setAttribute(EXPANDO_UID, 1);
                documentElement.removeAttribute(EXPANDO_UID);
                if (doesNotSupportDOMAttrModified) {
                    onSubtreeModified = function(e) {
                        var node = this, oldAttributes, newAttributes, key;
                        if (node === e.target) {
                            oldAttributes = node[EXPANDO_UID];
                            node[EXPANDO_UID] = newAttributes = getAttributesMirror(node);
                            for (key in newAttributes) {
                                if (!(key in oldAttributes)) {
                                    return callDOMAttrModified(0, node, key, oldAttributes[key], newAttributes[key], ADDITION);
                                } else if (newAttributes[key] !== oldAttributes[key]) {
                                    return callDOMAttrModified(1, node, key, oldAttributes[key], newAttributes[key], MODIFICATION);
                                }
                            }
                            for (key in oldAttributes) {
                                if (!(key in newAttributes)) {
                                    return callDOMAttrModified(2, node, key, oldAttributes[key], newAttributes[key], REMOVAL);
                                }
                            }
                        }
                    };
                    callDOMAttrModified = function(attrChange, currentTarget, attrName, prevValue, newValue, action) {
                        var e = {
                            attrChange: attrChange,
                            currentTarget: currentTarget,
                            attrName: attrName,
                            prevValue: prevValue,
                            newValue: newValue
                        };
                        e[action] = attrChange;
                        onDOMAttrModified(e);
                    };
                    getAttributesMirror = function(node) {
                        for (var attr, name, result = {}, attributes = node.attributes, i = 0, length = attributes.length; i < length; i++) {
                            attr = attributes[i];
                            name = attr.name;
                            if (name !== "setAttribute") {
                                result[name] = attr.value;
                            }
                        }
                        return result;
                    };
                }
            }
            function loopAndVerify(list, action) {
                for (var i = 0, length = list.length; i < length; i++) {
                    verifyAndSetupAndAction(list[i], action);
                }
            }
            function loopAndSetup(list) {
                for (var i = 0, length = list.length, node; i < length; i++) {
                    node = list[i];
                    patch(node, protos[getTypeIndex(node)]);
                }
            }
            function executeAction(action) {
                return function(node) {
                    if (isValidNode(node)) {
                        verifyAndSetupAndAction(node, action);
                        loopAndVerify(node.querySelectorAll(query), action);
                    }
                };
            }
            function getTypeIndex(target) {
                var is = target.getAttribute("is"), nodeName = target.nodeName.toUpperCase(), i = indexOf.call(types, is ? PREFIX_IS + is.toUpperCase() : PREFIX_TAG + nodeName);
                return is && -1 < i && !isInQSA(nodeName, is) ? -1 : i;
            }
            function isInQSA(name, type) {
                return -1 < query.indexOf(name + '[is="' + type + '"]');
            }
            function onDOMAttrModified(e) {
                var node = e.currentTarget, attrChange = e.attrChange, prevValue = e.prevValue, newValue = e.newValue;
                if (notFromInnerHTMLHelper && node.attributeChangedCallback && e.attrName !== "style") {
                    node.attributeChangedCallback(e.attrName, attrChange === e[ADDITION] ? null : prevValue, attrChange === e[REMOVAL] ? null : newValue);
                }
            }
            function onDOMNode(action) {
                var executor = executeAction(action);
                return function(e) {
                    asapQueue.push(executor, e.target);
                };
            }
            function onReadyStateChange(e) {
                if (dropDomContentLoaded) {
                    dropDomContentLoaded = false;
                    e.currentTarget.removeEventListener(DOM_CONTENT_LOADED, onReadyStateChange);
                }
                loopAndVerify((e.target || document).querySelectorAll(query), e.detail === DETACHED ? DETACHED : ATTACHED);
                if (IE8) purge();
            }
            function patchedSetAttribute(name, value) {
                var self = this;
                setAttribute.call(self, name, value);
                onSubtreeModified.call(self, {
                    target: self
                });
            }
            function setupNode(node, proto) {
                setPrototype(node, proto);
                if (observer) {
                    observer.observe(node, attributesObserver);
                } else {
                    if (doesNotSupportDOMAttrModified) {
                        node.setAttribute = patchedSetAttribute;
                        node[EXPANDO_UID] = getAttributesMirror(node);
                        node.addEventListener(DOM_SUBTREE_MODIFIED, onSubtreeModified);
                    }
                    node.addEventListener(DOM_ATTR_MODIFIED, onDOMAttrModified);
                }
                if (node.createdCallback && notFromInnerHTMLHelper) {
                    node.created = true;
                    node.createdCallback();
                    node.created = false;
                }
            }
            function purge() {
                for (var node, i = 0, length = targets.length; i < length; i++) {
                    node = targets[i];
                    if (!documentElement.contains(node)) {
                        targets.splice(i, 1);
                        verifyAndSetupAndAction(node, DETACHED);
                    }
                }
            }
            function verifyAndSetupAndAction(node, action) {
                var fn, i = getTypeIndex(node);
                if (-1 < i) {
                    patchIfNotAlready(node, protos[i]);
                    i = 0;
                    if (action === ATTACHED && !node[ATTACHED]) {
                        node[DETACHED] = false;
                        node[ATTACHED] = true;
                        i = 1;
                        if (IE8 && indexOf.call(targets, node) < 0) {
                            targets.push(node);
                        }
                    } else if (action === DETACHED && !node[DETACHED]) {
                        node[ATTACHED] = false;
                        node[DETACHED] = true;
                        i = 1;
                    }
                    if (i && (fn = node[action + "Callback"])) fn.call(node);
                }
            }
            document[REGISTER_ELEMENT] = function registerElement(type, options) {
                upperType = type.toUpperCase();
                if (!setListener) {
                    setListener = true;
                    if (MutationObserver) {
                        observer = function(attached, detached) {
                            function checkEmAll(list, callback) {
                                for (var i = 0, length = list.length; i < length; callback(list[i++])) {}
                            }
                            return new MutationObserver(function(records) {
                                for (var current, node, i = 0, length = records.length; i < length; i++) {
                                    current = records[i];
                                    if (current.type === "childList") {
                                        checkEmAll(current.addedNodes, attached);
                                        checkEmAll(current.removedNodes, detached);
                                    } else {
                                        node = current.target;
                                        if (notFromInnerHTMLHelper && node.attributeChangedCallback && current.attributeName !== "style") {
                                            node.attributeChangedCallback(current.attributeName, current.oldValue, node.getAttribute(current.attributeName));
                                        }
                                    }
                                }
                            });
                        }(executeAction(ATTACHED), executeAction(DETACHED));
                        observer.observe(document, {
                            childList: true,
                            subtree: true
                        });
                    } else {
                        asapQueue = [];
                        rAF(function ASAP() {
                            while (asapQueue.length) {
                                asapQueue.shift().call(null, asapQueue.shift());
                            }
                            rAF(ASAP);
                        });
                        document.addEventListener("DOMNodeInserted", onDOMNode(ATTACHED));
                        document.addEventListener("DOMNodeRemoved", onDOMNode(DETACHED));
                    }
                    document.addEventListener(DOM_CONTENT_LOADED, onReadyStateChange);
                    document.addEventListener("readystatechange", onReadyStateChange);
                    document.createElement = function(localName, typeExtension) {
                        var node = createElement.apply(document, arguments), name = "" + localName, i = indexOf.call(types, (typeExtension ? PREFIX_IS : PREFIX_TAG) + (typeExtension || name).toUpperCase()), setup = -1 < i;
                        if (typeExtension) {
                            node.setAttribute("is", typeExtension = typeExtension.toLowerCase());
                            if (setup) {
                                setup = isInQSA(name.toUpperCase(), typeExtension);
                            }
                        }
                        notFromInnerHTMLHelper = !document.createElement.innerHTMLHelper;
                        if (setup) patch(node, protos[i]);
                        return node;
                    };
                    HTMLElementPrototype.cloneNode = function(deep) {
                        var node = cloneNode.call(this, !!deep), i = getTypeIndex(node);
                        if (-1 < i) patch(node, protos[i]);
                        if (deep) loopAndSetup(node.querySelectorAll(query));
                        return node;
                    };
                }
                if (-2 < indexOf.call(types, PREFIX_IS + upperType) + indexOf.call(types, PREFIX_TAG + upperType)) {
                    throw new Error("A " + type + " type is already registered");
                }
                if (!validName.test(upperType) || -1 < indexOf.call(invalidNames, upperType)) {
                    throw new Error("The type " + type + " is invalid");
                }
                var constructor = function() {
                    return extending ? document.createElement(nodeName, upperType) : document.createElement(nodeName);
                }, opt = options || OP, extending = hOP.call(opt, EXTENDS), nodeName = extending ? options[EXTENDS].toUpperCase() : upperType, i = types.push((extending ? PREFIX_IS : PREFIX_TAG) + upperType) - 1, upperType;
                query = query.concat(query.length ? "," : "", extending ? nodeName + '[is="' + type.toLowerCase() + '"]' : nodeName);
                constructor.prototype = protos[i] = hOP.call(opt, "prototype") ? opt.prototype : create(HTMLElementPrototype);
                loopAndVerify(document.querySelectorAll(query), ATTACHED);
                return constructor;
            };
        })(window, document, Object, "registerElement");
        (function(window, Object, HTMLElement) {
            if (HTMLElement in window) return;
            var timer = 0, clearTimeout = window.clearTimeout, setTimeout = window.setTimeout, ElementPrototype = Element.prototype, gOPD = Object.getOwnPropertyDescriptor, defineProperty = Object.defineProperty, notifyChanges = function() {
                document.dispatchEvent(new CustomEvent("readystatechange"));
            }, scheduleNotification = function(target, name) {
                clearTimeout(timer);
                timer = setTimeout(notifyChanges, 10);
            }, wrapSetter = function(name) {
                var descriptor = gOPD(ElementPrototype, name), substitute = {
                    configurable: descriptor.configurable,
                    enumerable: descriptor.enumerable,
                    get: function() {
                        return descriptor.get.call(this);
                    },
                    set: function asd(value) {
                        delete ElementPrototype[name];
                        this[name] = value;
                        defineProperty(ElementPrototype, name, substitute);
                        scheduleNotification(this);
                    }
                };
                defineProperty(ElementPrototype, name, substitute);
            }, wrapMethod = function(name) {
                var descriptor = gOPD(ElementPrototype, name), value = descriptor.value;
                descriptor.value = function() {
                    var result = value.apply(this, arguments);
                    scheduleNotification(this);
                    return result;
                };
                defineProperty(ElementPrototype, name, descriptor);
            };
            wrapSetter("innerHTML");
            wrapSetter("innerText");
            wrapSetter("outerHTML");
            wrapSetter("outerText");
            wrapSetter("textContent");
            wrapMethod("appendChild");
            wrapMethod("applyElement");
            wrapMethod("insertAdjacentElement");
            wrapMethod("insertAdjacentHTML");
            wrapMethod("insertAdjacentText");
            wrapMethod("insertBefore");
            wrapMethod("insertData");
            wrapMethod("replaceAdjacentText");
            wrapMethod("replaceChild");
            wrapMethod("removeChild");
            window[HTMLElement] = Element;
        })(window, Object, "HTMLElement");
    })();
    (function(inherit, mixin, eventsClass, templateManager, WatchJS, camelize, smartCallback, ComponentPreFactory, initAngular, scopeGenerator, WebElementFactory) {
        function getRandomColor() {
            var letters = "0123456789ABCDEF".split("");
            var color = "#";
            for (var i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        }
        var startextend = function(target, proto) {
            for (var prop in proto) {
                if (proto.hasOwnProperty(prop)) {
                    if ("object" === typeof proto[prop]) {
                        target[prop] = proto[prop] instanceof Array ? [] : {};
                        startextend(target[prop], proto[prop]);
                    } else {
                        target[prop] = proto[prop];
                    }
                }
            }
        };
        var componentAttacher = function() {
            if (this.synthetic.__config__.$$angularInitialedStage > 2) {}
            if (!this.synthetic.__config__.permanent) {
                var pe = this.synthetic.$element.parentNode;
                while (!(pe === null || "undefined" !== typeof pe.synthetic)) {
                    pe = pe.parentNode;
                }
                if (this.synthetic.$parent) {
                    this.synthetic.$parent.$$unRegisterChild(this.synthetic);
                }
                this.synthetic.$parent = pe !== null && "object" === typeof pe.synthetic ? pe.synthetic : false;
                if (this.synthetic.$parent) {
                    this.synthetic.$parent.$$registerChild(this.synthetic);
                    this.synthetic.trigger("parentDefined");
                }
            }
            this.synthetic.trigger("attached", [ this.synthetic ]);
            this.synthetic.__config__.attachedEventFires = true;
        };
        var componentCreater = function(componentFactory) {
            if (this.synthetic) return false;
            for (var i = 0; i < componentFactory.constructors.length; ++i) {
                WebElementFactory.inherit(componentFactory.constructors[i]);
            }
            var WebElement = new WebElementFactory(this, componentFactory);
        };
        var regScriptContent = /<script[^>]*>([.\w\d\r\t\n\.\s;'"{}\(\)]*)<\/script>/i, regSyntheticScript = /^[\t\r\s]*Synthetic\(/i;
        var Synthetic = function(element) {
            if ("object" === typeof element.synthetic) {
                return element.synthetic;
            } else if ("function" === typeof element) {
                if (Synthetic.$$lastElementFactory) {
                    Synthetic.$$lastElementFactory.$queue(function() {
                        this.$inject(element)();
                    });
                }
                return false;
            }
            return false;
        };
        Synthetic.prototype = {
            construct: Synthetic
        };
        Synthetic.search = function(element) {
            while (element !== null && "object" !== typeof element.synthetic) {
                element = element.parentNode;
            }
            return element !== null && element.synthetic ? element.synthetic : false;
        };
        for (var prop in eventsClass.prototype) {
            if (eventsClass.prototype.hasOwnProperty(prop) && "function" === typeof eventsClass.prototype[prop]) {
                Synthetic[prop] = eventsClass.prototype[prop];
            }
        }
        eventsClass.call(Synthetic);
        Synthetic.log = function() {};
        Synthetic.$$angularBootstraped = false;
        Synthetic.$$lastElementFactory = false;
        Synthetic.hasPropertySubKey = function(property, subkey) {
            if (!("string" === typeof property || property instanceof Array)) return false;
            return !!~("string" === typeof property ? property.replace(" ", "").split(",") : property).indexOf(subkey);
        };
        Synthetic.createComponent = function(componentOptions, constructor) {
            var defaultOptions = {
                name: "",
                engine: "sinthezia"
            };
            componentOptions = "string" !== typeof componentOptions ? mixin(defaultOptions, componentOptions) : mixin(defaultOptions, {
                name: componentOptions
            });
            if ("string" === typeof componentOptions.engine) {
                componentOptions.engine = {
                    name: componentOptions.engine,
                    initial: false
                };
            } else if ("object" === typeof componentOptions.engine && componentOptions.engine instanceof Array) {
                componentOptions.engine = {
                    name: componentOptions.engine[0],
                    initial: componentOptions.engine[1] || false
                };
            }
            if (componentOptions.name.indexOf("-") < 0) throw "Module name must have `-` symbol";
            var componentFactory = new ComponentPreFactory(componentOptions), prototype = smartCallback.call({
                $component: componentFactory
            }, constructor)();
            if ("object" === typeof prototype) {
                componentFactory.proto(prototype);
            } else if ("function" === typeof prototype) {
                componentFactory.construct(prototype);
            }
            componentOptions.scope = "object" === typeof componentOptions.scope ? componentOptions.scope : {};
            if (componentOptions.engine.name === "angular") {
                if ("undefined" === typeof Synthetic.$$angularApp) {
                    initAngular();
                }
                if ("function" === typeof componentFactory.options.engine.initial) {
                    componentFactory.options.engine.initial(Synthetic.$$angularApp);
                }
                var rcolor = getRandomColor();
                Synthetic.$$angularApp.directive(camelize(componentOptions.name), function() {
                    return {
                        restrict: "E",
                        priority: 998,
                        scope: true,
                        controller: function($element) {},
                        compile: function($element, $rscope, $a, $controllersBoundTransclude) {
                            Synthetic($element[0]).__config__.$$angularDirectived = true;
                            return {
                                pre: function($scope, $element) {
                                    startextend($scope, componentOptions.scope);
                                    Synthetic($element[0]).__config__.$$angularDirectived = true;
                                    scopeGenerator($element[0].synthetic, $scope);
                                    return function(scope) {};
                                },
                                post: function($scope, $element) {
                                    Synthetic($element[0]).__config__.$$angularInitialedStage = 3;
                                }
                            };
                        }
                    };
                });
            }
            document.registerElement(componentOptions.name, {
                prototype: Object.create(HTMLElement.prototype, {
                    createdCallback: {
                        value: function() {
                            componentCreater.call(this, componentFactory);
                        }
                    },
                    attachedCallback: {
                        value: function() {
                            this.synthetic.trigger("attached");
                            if (this.synthetic.__config__.allWaitingForResolve === "attached") this.synthetic.__config__.allWaitingForResolve = false;
                            componentAttacher.call(this);
                        }
                    },
                    detachedCallback: {
                        value: function() {
                            this.synthetic.__config__.allWaitingForResolve = "attached";
                            this.synthetic.trigger("detached", [ this.synthetic ]);
                        }
                    },
                    attributeChangedCallback: {
                        configurable: true,
                        writable: true,
                        enumerable: true,
                        value: function(name, previousValue, value) {
                            var camelized = camelize(name);
                            if (this.synthetic.destoryed) return false;
                            if ("object" === typeof Synthetic.$$angularApp && this.synthetic.__config__.$$angularInitialedStage > 1) {
                                if (previousValue !== value) {
                                    var testS = new Date();
                                    this.synthetic.$apply(function($self, $scope) {
                                        $scope.attributes[camelized] = value;
                                        if (name.substr(0, 5) === "data-") {
                                            $scope.properties[camelize(name.substr(5))] = value;
                                        }
                                    });
                                    if (value === "") value = false;
                                    if (this.synthetic.$$attrsWatchers[camelized]) {
                                        for (var i = 0; i < this.synthetic.$$attrsWatchers[camelized].length; ++i) {
                                            this.synthetic.$$attrsWatchers[camelized][i].call(this.synthetic, false, "set", value);
                                        }
                                    }
                                    this.synthetic.trigger("attributeChanged", [ this.synthetic, name, previousValue, value ]);
                                }
                            } else {
                                if (previousValue !== value) {
                                    this.synthetic.$injectors.$scope.attributes[camelize(name)] = value;
                                    if (name.substr(0, 5) === "data-") {
                                        this.synthetic.$injectors.$scope.properties[camelize(name.substr(5))] = value;
                                    }
                                    this.synthetic.trigger("attributeChanged", [ this.synthetic, name, previousValue, value ]);
                                }
                            }
                        }
                    }
                })
            });
            return componentFactory;
        };
        if (window) window.Synthetic = Synthetic;
        return Synthetic;
    })(inherit2, mixin2, classEvents, null, watch, camelize, smartCallback, preFactory, initAngular, scopeGenerator, webElementFactory);
})();