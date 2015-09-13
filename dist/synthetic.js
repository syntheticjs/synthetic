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
    }(mixin);
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
    var classEvents = function(smartCallback) {
        var Events = function() {
            this.eventListners = {};
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
        Events.prototype = {
            constructor: Events,
            bind: function(e, callback, once) {
                if (typeof this.eventListners[e] != "object") this.eventListners[e] = [];
                this.eventListners[e].push({
                    callback: callback,
                    once: once
                });
                return this;
            },
            on: function(e, callback, once) {
                if (typeof this.eventListners[e] != "object") this.eventListners[e] = [];
                this.eventListners[e].push({
                    callback: this.$inject(callback),
                    once: once || false
                });
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
            }
        };
        return Events;
    }(smartCallback);
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
    var generator = function(classEvents, minTemplate) {
        var synthetModule = function($synthet) {
            this.$synthet = $synthet;
            this.$controller = $synthet;
            this.$apply = function(cb) {
                return $synthet.$apply(cb);
            };
        };
        return function(synthet) {
            this.$ = synthet;
            this.configuration = {
                template: false
            };
            this.$.on("angularResolved", function() {
                var $ = this;
                angular.element(synthet.__selfie__.$element).scope().$watch(function() {
                    $.trigger("DOMChanged");
                });
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
            render: function(template, module) {
                console.log("re-render", this.$.$element);
                var $ = this;
                if (template) this.configuration.template = template;
                this.configuration.module = "function" === typeof module ? module : false;
                if (this.$.__config__.$$angularInitialedStage > 1) {
                    this.$inject(function($self, template, module) {
                        var test = $self.__config__.$$angularCompile(template)($self.__config__.$$angularScope);
                        $self.__config__.$$angularElement.html(test);
                        $.trigger("DOMChanged");
                        if (module) {
                            $.setup(module);
                        }
                    })(this.configuration.template, this.configuration.module);
                } else {
                    this.$.__selfie__.$element.innerHTML = this.$.__selfie__.$element.innerHTML = minTemplate(this.configuration.template, this.$.__selfie__.$scope);
                    if (this.configuration.module) {
                        $.setup(this.configuration.module);
                    }
                    this.trigger("DOMChanged");
                }
            },
            setup: function(module) {
                var nm = function($synthet) {}.inherit(module).inherit(synthetModule);
                if ("function" === typeof this.$.__config__.templateModulePrototype) {
                    nm = nm.inherit();
                } else if ("object" === typeof this.$.__config__.templateModulePrototype) {
                    var overMod = function() {}.proto(this.$.__config__.templateModulePrototype);
                    nm = nm.inherit(overMod);
                }
                this.$.module = new nm(this.$);
            }
        });
    }(classEvents, min);
    var WebElementPrototype = function(getObjectByXPath, watchJS, smartCallback, classEvents) {
        return function() {}.inherit(classEvents).proto({
            watch: function() {
                if (this.__config__.allWaitingForResolve) {
                    this.bind(this.__config__.allWaitingForResolve, function(args) {
                        this.watch.apply(this, args);
                    }.bind(this, arguments));
                    return;
                }
                var self = this, objectXPath = false, properties, callback;
                arguments.length > 2 ? (objectXPath = arguments[0], 
                properties = arguments[1], callback = arguments[2]) : (properties = arguments[0], 
                callback = arguments[1]);
                var xpath = objectXPath ? objectXPath.split(".") : [];
                requiredProperties = [];
                for (var i = 0; i < properties.length; ++i) {
                    requiredProperties.push(xpath.concat(properties[i].split(".")));
                }
                var getDatas = function(requiredProperties, rprops) {
                    if (rprops === false) throw "fuuuuck!";
                    return function(prop, action, newValue) {
                        var alldata = [];
                        for (var x = 0; x < requiredProperties.length; ++x) {
                            if (rprops === requiredProperties[x]) alldata.push(newValue); else alldata.push(getObjectByXPath(self.__selfie__.$scope, requiredProperties[x]));
                        }
                        self.$inject(callback).apply(self, alldata);
                    };
                };
                if (!Synthetic.$$angularApp) {
                    getDatas.call(self, requiredProperties, false).call(self);
                }
                var watchFabric = function(rprops, wobject, prop) {
                    if ("undefined" === typeof wobject[prop]) wobject[prop] = false;
                    if (Synthetic.$$angularApp) {
                        try {
                            angular.element(self.__selfie__.$element).scope().$watch(rprops.join("."), function(newValue) {
                                this.call(self, false, "set", newValue);
                            }.bind(getDatas(requiredProperties, rprops)));
                        } catch (e) {
                            console.error("Errors", self.__config__.$$angularInitialedStage);
                        }
                    } else {
                        watchJS.watch(wobject, prop, getDatas(requiredProperties, rprops));
                    }
                };
                for (var i = 0; i < requiredProperties.length; ++i) {
                    watchFabric(requiredProperties[i], getObjectByXPath(this.__selfie__.$scope, requiredProperties[i].slice(0, requiredProperties[i].length - 1)), requiredProperties[i][requiredProperties[i].length - 1]);
                }
            },
            $inject: function(callback) {
                if (Synthetic.$$angularApp && this.__config__.$$angularScope && this.__config__.$$angularInitialedStage > 1) {
                    var self = this;
                    return function() {
                        var nargs = Array.prototype.slice.apply(arguments), context = this;
                        self.__config__.$$angularTimeout(function() {
                            smartCallback.call(self.__selfie__, callback, self).apply(context, nargs);
                        });
                    };
                } else {
                    return smartCallback.call(this.__selfie__, callback, this);
                }
            },
            $queue: function(callback) {
                if (this.__config__.allWaitingForResolve) {
                    this.bind(this.__config__.allWaitingForResolve, callback);
                } else {
                    callback.apply(this);
                }
                return this;
            },
            $apply: function(callback) {
                this.$inject(callback)();
            },
            $template: function(content) {
                this.__selfie__.$generator.template(content);
            },
            $destroy: function() {}
        });
    }(getObjectByXPath, watch, smartCallback, classEvents);
    var camelize = function() {
        return function(text) {
            return text.replace(/-([\da-z])/gi, function(all, letter) {
                return letter.toUpperCase();
            });
        };
    }();
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
    (function(inherit, mixin, eventsClass, templateManager, Generator, WebElementPrototype, WatchJS, camelize, smartCallback, ComponentPreFactory) {
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
            if (componentOptions.name.indexOf("-") < 0) throw "Module name must have `-` symbol";
            var componentFactory = new ComponentPreFactory(componentOptions), prototype = smartCallback.call({
                $component: componentFactory
            }, constructor)();
            if ("object" === typeof prototype) {
                componentFactory.proto(prototype);
            } else if ("function" === typeof prototype) {
                componentFactory.construct(prototype);
            }
            document.registerElement(componentOptions.name, {
                prototype: Object.create(HTMLElement.prototype, {
                    createdCallback: {
                        value: function() {
                            if (this.synthetic) return false;
                            var WebElementFactory = function(element, component) {
                                Synthetic.$$lastElementFactory = this;
                                this.$element = element;
                                Object.defineProperty(this, "$scope", {
                                    get: function() {
                                        return this.__selfie__.$scope;
                                    }
                                });
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
                                        $$angularScope: false,
                                        $$angularInitialedStage: 0,
                                        createdEventFires: false,
                                        attachedEventFires: false,
                                        templateModulePrototype: false
                                    }, component.options)
                                });
                                var $$scope = {
                                    attributes: {},
                                    properties: {},
                                    html: {},
                                    uid: "syntheticElement" + Math.round(Math.random() * 1e4),
                                    test: {
                                        abc: "helloworld"
                                    }
                                };
                                Object.defineProperty(this, "__selfie__", {
                                    enumerable: false,
                                    writable: false,
                                    configurable: true,
                                    value: {
                                        $scope: $$scope,
                                        $element: element,
                                        $self: this,
                                        $component: component,
                                        $generator: new Generator(this)
                                    }
                                });
                                if ("object" === typeof angular && angular.bootstrap && component.options.engine === "angular") {
                                    var $self = this;
                                    this.$$angularControllerName = "singular" + new Date().getTime() + Math.round(Math.random() * 1e4);
                                    this.__config__.$$angularInitialedStage = 1;
                                    this.__config__.allWaitingForResolve = "angularResolved";
                                    if ("undefined" === typeof Synthetic.$$angularApp) {
                                        Synthetic.log("$$configure angular app");
                                        Synthetic.$$angularApp = angular.module("syntheticApp", [], function() {}.bind(this));
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
                                        }).run(function($rootScope, $compile, $q) {
                                            Synthetic.$$angularRootScope = $rootScope;
                                            Synthetic.$$angularRCompile = $compile;
                                            Synthetic.$$angularQ = $q;
                                        });
                                        if ("object" !== typeof angular.element(document.body).injector()) {
                                            angular.element(document.body).ready(function() {
                                                angular.bootstrap(document.body, [ "syntheticApp" ]);
                                                Synthetic.$$angularBootstraped = true;
                                                Synthetic.trigger("angularBootstraped");
                                            }.bind(this));
                                        }
                                    }
                                    var controllerGenerator = function() {
                                        Synthetic.log("$$controller registred", $self.$$angularControllerName);
                                        var deferred = Synthetic.$$angularQ.defer();
                                        Synthetic.$$angularApp.controller(this.$$angularControllerName, function($element, $scope, $timeout, $compile, $element) {
                                            Synthetic.log("$$controller initialed", $self.$$angularControllerName);
                                            angular.extend($scope, $$scope);
                                            $self.__selfie__.$scope = $scope;
                                            $self.__config__.$$angularInitialedStage = 2;
                                            $self.__config__.allWaitingForResolve = false;
                                            $self.__config__.$$angularScope = angular.element($self.__selfie__.$element).scope();
                                            $self.__config__.$$angularTimeout = $timeout;
                                            $self.__config__.$$angularCompile = $compile;
                                            $self.__config__.$$angularElement = $element;
                                            $self.__selfie__.$scope.parent = function() {
                                                console.log(">>>PARNT", arguments);
                                                return {
                                                    test: "wow!"
                                                };
                                            };
                                            $self.trigger("angularResolved");
                                        });
                                        element.setAttribute("ng-controller", $self.$$angularControllerName);
                                        setTimeout(function() {
                                            if ($self.__config__.$$angularInitialedStage > 1) return;
                                            angular.element(document.body).injector().invoke(function($compile) {
                                                var scope = angular.element(element).scope();
                                                $compile(element)(scope);
                                            });
                                        });
                                        Object.defineProperty(this, "$$angular", {
                                            enumerable: false,
                                            writable: false,
                                            configurable: false,
                                            value: Synthetic.$$angularApp
                                        });
                                        Object.defineProperty(this, "$$angular", {
                                            enumerable: false,
                                            writable: false,
                                            configurable: false,
                                            value: Synthetic.$$angularApp
                                        });
                                    }.bind(this);
                                    if (Synthetic.$$angularBootstraped) {
                                        controllerGenerator();
                                    } else {
                                        Synthetic.bind("angularBootstraped", controllerGenerator);
                                    }
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
                                        } else {
                                            this.__selfie__.$scope.html[camelize(element.childNodes[i].tagName.toLowerCase())] = element.childNodes[i].innerHTML;
                                        }
                                    }
                                }
                                for (var z = 0; z < element.attributes.length; z++) {
                                    this.__selfie__.$scope.attributes[camelize(element.attributes[z].name)] = element.attributes[z].value;
                                    if (element.attributes[z].name.substr(0, 5) === "data-") this.__selfie__.$scope.properties[camelize(element.attributes[z].name.substr(5))] = element.attributes[z].value;
                                }
                                this.$queue(function() {
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
                                    for (var i = 0; i < component.watchers.length; ++i) {
                                        this.watch.apply(this, component.watchers[i]);
                                    }
                                });
                            }.inherit(WebElementPrototype);
                            for (var i = 0; i < componentFactory.constructors.length; ++i) {
                                WebElementFactory.inherit(componentFactory.constructors[i]);
                            }
                            WebElementFactory.inherit(WebElementPrototype);
                            var WebElement = new WebElementFactory(this, componentFactory);
                        }
                    },
                    attachedCallback: {
                        value: function() {
                            Synthetic.log(this.synthetic.__config__.$$angularInitialedStage);
                            if (this.synthetic.__config__.$$angularInitialedStage === 1) {}
                            this.synthetic.trigger("attached", [ this.synthetic ]);
                            this.synthetic.__config__.attachedEventFires = true;
                        }
                    },
                    detachedCallback: {
                        value: function() {
                            this.synthetic.trigger("detached", [ this.synthetic ]);
                        }
                    },
                    attributeChangedCallback: {
                        configurable: true,
                        writable: true,
                        enumerable: true,
                        value: function(name, previousValue, value) {
                            if ("object" === typeof Synthetic.$$angularApp && this.synthetic.__config__.$$angularInitialedStage > 1) {
                                if (previousValue !== value) {
                                    this.synthetic.__config__.$$angularTimeout(function() {
                                        angular.element(this.synthetic.__selfie__.$element).scope().$apply(function() {
                                            this.synthetic.__selfie__.$scope.attributes[camelize(name)] = value;
                                            if (name.substr(0, 5) === "data-") {
                                                this.synthetic.__selfie__.$scope.properties[camelize(name.substr(5))] = value;
                                            }
                                            this.synthetic.trigger("attributeChanged", [ this.synthetic, name, previousValue, value ]);
                                        }.bind(this));
                                    }.bind(this));
                                }
                            } else {
                                if (previousValue !== value) {
                                    this.synthetic.__selfie__.$scope.attributes[camelize(name)] = value;
                                    if (name.substr(0, 5) === "data-") {
                                        this.synthetic.__selfie__.$scope.properties[camelize(name.substr(5))] = value;
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
        if (window) window.Synthet = window.Synthetic = Synthetic;
        return Synthet;
    })(inherit2, mixin2, classEvents, null, generator, WebElementPrototype, watch, camelize, smartCallback, preFactory);
})();