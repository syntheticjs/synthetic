(function(m, o, r, u, l, u, s) {
    var querySelector = function() {
        (function() {
            if (!HTMLElement.prototype.querySelectorAll) {
                throw new Error("rootedQuerySelectorAll: This polyfill can only be used with browsers that support querySelectorAll");
            }
            var container = document.createElement("div");
            try {
                container.querySelectorAll(":scope *");
            } catch (e) {
                var scopeRE = /^\s*:scope/gi;
                function overrideNodeMethod(prototype, methodName) {
                    var oldMethod = prototype[methodName];
                    prototype[methodName] = function(query) {
                        var nodeList, gaveId = false, gaveContainer = false;
                        if (query.match(scopeRE)) {
                            query = query.replace(scopeRE, "");
                            if (!this.parentNode) {
                                container.appendChild(this);
                                gaveContainer = true;
                            }
                            parentNode = this.parentNode;
                            if (!this.id) {
                                gaveId = this.attributeChangedCallback || true;
                                this.attributeChangedCallback = false;
                                this.id = "rootedQuerySelector_id_" + new Date().getTime();
                            }
                            nodeList = oldMethod.call(parentNode, "#" + this.id + " " + query);
                            if (gaveId) {
                                this.id = "";
                                if ("function" === typeof gaveId) this.attributeChangedCallback = gaveId;
                                gaveId = null;
                            }
                            if (gaveContainer) {
                                container.removeChild(this);
                            }
                            return nodeList;
                        } else {
                            return oldMethod.call(this, query);
                        }
                    };
                }
                overrideNodeMethod(HTMLElement.prototype, "querySelector");
                overrideNodeMethod(HTMLElement.prototype, "querySelectorAll");
            }
        })();
        var regPseudoClasssDt = /:(eq|nth\-child)\(([0-9n\+ ]+)\)/gi, queryExpr = /<([a-zA-Z0-9_]+) \/>/i, argsExpr = /\[([a-zA-Z0-9_\-]*)[ ]?=([ ]?[^\]]*)\]/i, psopi = {
            eq: function(elements, attrs) {
                var index;
                if (!isNaN(index = parseInt(attrs[2]))) {
                    return [ index < 0 && index * -1 < elements.length ? elements[elements.length - index] : index < elements.length ? elements[index] : [] ];
                } else {
                    return [];
                }
            },
            "nth-child": function(elements, attrs) {
                var n = false, i = 0, rec = [], index;
                if (!isNaN(index = parseInt(attrs[2]))) {
                    n = attrs[2].indexOf("n") >= 0;
                    for (;i < elements.length; i++) {
                        if (!n && i === index) rec.push(elements[i]);
                        if (n && i % index === 0) rec.push(elements[i]);
                    }
                } else {
                    return [];
                }
                return rec;
            }
        }, pseusoSelect = function(elements, selector) {
            var psop = regPseudoClasssDt.exec(selector);
            if ("function" !== typeof psopi[psop[1]]) {
                return [];
            } else {
                return psopi[psop[1]](elements, psop);
            }
        }, queryFinder = function(query, root) {
            var prefix;
            root && root instanceof HTMLElement ? prefix = ":scope " : prefix = "";
            switch (typeof query) {
              case "string":
                var queryExpr = /<([a-zA-Z0-9_]+) \/>/i, argsExpr = /\[([a-zA-Z0-9_\-]*)[ ]?=([ ]?[^\]]*)\]/i;
                if (query.indexOf("[") > -1 && argsExpr.exec(query)) {
                    var patch = true;
                    query = query.replace(argsExpr, '[$1="$2"]');
                }
                if (queryExpr.exec(query) === null) {
                    if (query.length === 0) return new Array();
                    try {
                        return root.querySelectorAll(prefix + query);
                    } catch (e) {
                        regPseudoClasssDt.lastIndex = 0;
                        if (regPseudoClasssDt.test(query) == true) {
                            var ps = query.match(regPseudoClasssDt)[0];
                            return pseusoSelect(queryFinder(query.replace(regPseudoClasssDt, ""), root), ps);
                        } else {
                            console.log(e);
                            throw "querySelectorAll not support query: " + query;
                        }
                    }
                } else {
                    return [ document.createElement(result[1].toUpperCase()) ];
                }
                ;
                break;

              case "function":
                return [];
                break;

              case "object":
                if (query instanceof Array) {
                    return query;
                }
                if (query === null) {
                    return [];
                } else {
                    if (query == window) {
                        return [ query ];
                    } else if (query.jquery) {
                        var elements = [];
                        for (var j = 0; j < query.length; j++) elements.push(query[j]);
                        return elements;
                    } else if (query.brahma) {
                        var elements = [];
                        for (var j = 0; j < query.length; j++) elements.push(query[j]);
                        return elements;
                    } else {
                        return [ query ];
                    }
                }
                break;

              case "undefined":
              default:
                return [ query ];
                break;
            }
        };
        return function(query, root) {
            var root = root || document, roots = [];
            if (root instanceof NodeList || root instanceof Array) {
                roots = Array.prototype.slice.apply(root);
            } else {
                roots = [ root ];
            }
            var stack = [];
            for (var i = 0; i < roots.length; ++i) {
                var response = queryFinder(query, roots[i]);
                if (("object" === typeof response || "function" === typeof response) && "number" === typeof response.length) {
                    for (var r = 0; r < response.length; ++r) {
                        stack.push(response[r]);
                    }
                }
            }
            return stack;
        };
    }();
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
    var mutagen = function(extendedQuerySelector) {
        var each = function(subject, fn) {
            for (var prop in subject) {
                if (subject.hasOwnProperty(prop)) {
                    fn.call(subject, subject[prop], prop);
                }
            }
        }, regPlaceholder = /\{\{([^\} \.]*)([\.~a-zA-Z0-9_]*)\}\}/gi;
        var Mutagen = function(htmlElement, preProcessor, postProcessor) {
            var template = this, matches = template.match(regPlaceholder), replacings = {};
            if ("function" === typeof preProcessor) preProcessor.call(htmlElement, replacings);
            if (matches !== null) matches.forEach(function(dph) {
                regPlaceholder.lastIndex = 0;
                var placeholderData = regPlaceholder.exec(dph), placeholder = placeholderData[1], keyname = placeholderData[2] !== "" ? placeholderData[2].substr(1) : "innerHTML";
                if ("undefined" !== typeof replacings[placeholder]) return true;
                replacings[dph] = replacings[dph] || "";
                if (placeholder === "content") {
                    replacings[dph] = htmlElement.innerHTML;
                } else {
                    var elements = placeholder === "" ? [ htmlElement ] : extendedQuerySelector(placeholder, htmlElement);
                    if (elements) {
                        if ("undefined" !== typeof elements[0]) {
                            if (keyname.substr(0, 1) === "~") {
                                keyname = keyname.substr(1);
                                replacings[dph] = "";
                                for (var z = 0; z < elements[0].attributes.length; z++) {
                                    if (elements[0].attributes[z].name === keyname) {
                                        replacings[dph] = elements[0].attributes[z].value;
                                        break;
                                    }
                                }
                            } else if ("undefined" !== typeof elements[0][keyname]) {
                                replacings[dph] = elements[0][keyname];
                            } else {
                                replacings[dph] = "undefined";
                            }
                        } else {
                            replacings[dph] = replacings[dph] || "";
                        }
                    }
                }
            });
            each(replacings, function(content, ph) {
                template = template.replace(ph, content);
            });
            if ("function" === typeof postProcessor) postProcessor.call(htmlElement, template);
            htmlElement.innerHTML = template;
            return template;
        };
        Mutagen.query = extendedQuerySelector;
        return Mutagen;
    }(querySelector);
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
    var events = function() {
        var Events = function() {
            this.eventListners = {};
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
            on: function() {
                this.bind.apply(this, arguments);
                return this;
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
                        if (typeof this.eventListners[e][i] === "object") {
                            if (typeof this.eventListners[e][i].callback === "function") response = this.eventListners[e][i].callback.apply(this, args);
                            if (this.eventListners[e][i].once) {
                                todelete.push(i);
                            }
                        }
                    }
                    if (todelete.length > 0) for (var i in todelete) {
                        this.eventListners[e].splice(todelete[i], 1);
                    }
                }
                return response;
            }
        };
        return Events;
    }();
    var camelize = function() {
        return function(text) {
            return text.replace(/-([\da-z])/gi, function(all, letter) {
                return letter.toUpperCase();
            });
        };
    }();
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
    (function(mutagen, inherit, eventsClass, camelize) {
        var customeElement = inherit(function(element, component) {
            this.$ = element;
            this.component = component;
            this.attributes = {};
            this.cultAttrs();
        }, eventsClass);
        customeElement.prototype.query = function(queryString) {
            var nodeList = mutagen.query(queryString, this.$);
            if (nodeList instanceof NodeList || nodeList instanceof Array) {
                return Array.prototype.slice.apply(nodeList);
            } else {
                return [];
            }
        };
        customeElement.prototype.cultAttrs = function() {
            this.attributes = {};
            this.properties = {};
            for (var z = 0; z < this.$.attributes.length; z++) {
                this.attributes[camelize(this.$.attributes[z].name)] = this.$.attributes[z].value;
                if (this.$.attributes[z].name.substr(0, 5) === "data-") this.properties[this.$.attributes[z].name.substr(5)] = this.$.attributes[z].value;
            }
        };
        var Module = inherit(function(name) {
            this.name = name;
            this._template = "";
            this.elementPrototype = {};
        }, eventsClass);
        Module.prototype.setTemplate = function(template) {
            this._template = template;
            this.on("created", function(module) {
                if (this._template !== false) mutagen.call(this._template, module.$);
            });
        };
        Module.prototype.template = function(template, defaultPlaceholders) {
            this._template = [ template, defaultPlaceholders || {} ];
            this.on("created", function(module) {
                mutagen.call(this._template[0], module.$, function(replacings) {
                    for (var prop in defaultPlaceholders) {
                        if (defaultPlaceholders.hasOwnProperty(prop)) replacings["{{" + prop + "}}"] = defaultPlaceholders[prop];
                    }
                });
            });
            return this;
        };
        Module.prototype.setElementPrototype = function(proto) {
            this.elementPrototype = proto;
        };
        Module.prototype.register = function() {
            var component = this;
            document.registerElement(this.name, {
                prototype: Object.create(HTMLElement.prototype, {
                    createdCallback: {
                        value: function() {
                            var WebModule = function() {};
                            WebModule.prototype = component.elementPrototype;
                            WebModule.prototype.constructor = WebModule;
                            WebModule = inherit(WebModule, customeElement);
                            var ce = new WebModule(this, component);
                            Object.defineProperty(this, "synthetic", {
                                enumerable: false,
                                writable: false,
                                configurable: false,
                                value: ce
                            });
                            component.trigger("created", [ ce ]);
                        }
                    },
                    attachedCallback: {
                        value: function() {
                            component.trigger("attached", [ this.synthetic ]);
                        }
                    },
                    detachedCallback: {
                        value: function() {
                            component.trigger("detached", [ this.synthetic ]);
                        }
                    },
                    attributeChangedCallback: {
                        configurable: true,
                        writable: true,
                        enumerable: true,
                        value: function(name, previousValue, value) {
                            if (previousValue !== value) {
                                this.synthetic.attributes[camelize(name)] = value;
                                if (name.substr(0, 5) === "data-") {
                                    this.synthetic.properties[camelize(name.substr(5))] = value;
                                }
                                component.trigger("attributeChanged", [ this.synthetic, name, previousValue, value ]);
                            }
                        }
                    }
                })
            });
        };
        var Synthet = function(element) {
            if ("object" !== typeof element.synthetic) {
                return null;
            }
            return element.synthetic;
        };
        Synthet.prototype = {
            construct: Synthet
        };
        Synthet.newComponent = function(name, template, elementPrototype) {
            if (name.indexOf("-") < 0) throw "Module name must have `-` symbol";
            var component = new Module(name);
            component.setTemplate(template);
            component.setElementPrototype(elementPrototype || {});
            return component;
        };
        if (window) window.Synthet = Synthet;
        return Synthet;
    })(mutagen, inherit, events, camelize);
})();