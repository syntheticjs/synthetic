(() => {
  // node_modules/@vue/shared/dist/shared.esm-bundler.js
  function makeMap(str, expectsLowerCase) {
    const map = /* @__PURE__ */ Object.create(null);
    const list = str.split(",");
    for (let i = 0; i < list.length; i++) {
      map[list[i]] = true;
    }
    return expectsLowerCase ? (val) => !!map[val.toLowerCase()] : (val) => !!map[val];
  }
  var specialBooleanAttrs = `itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly`;
  var isBooleanAttr = /* @__PURE__ */ makeMap(specialBooleanAttrs + `,async,autofocus,autoplay,controls,default,defer,disabled,hidden,loop,open,required,reversed,scoped,seamless,checked,muted,multiple,selected`);
  var EMPTY_OBJ = true ? Object.freeze({}) : {};
  var EMPTY_ARR = true ? Object.freeze([]) : [];
  var extend = Object.assign;
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  var hasOwn = (val, key) => hasOwnProperty.call(val, key);
  var isArray = Array.isArray;
  var isMap = (val) => toTypeString(val) === "[object Map]";
  var isString = (val) => typeof val === "string";
  var isSymbol = (val) => typeof val === "symbol";
  var isObject = (val) => val !== null && typeof val === "object";
  var objectToString = Object.prototype.toString;
  var toTypeString = (value) => objectToString.call(value);
  var toRawType = (value) => {
    return toTypeString(value).slice(8, -1);
  };
  var isIntegerKey = (key) => isString(key) && key !== "NaN" && key[0] !== "-" && "" + parseInt(key, 10) === key;
  var cacheStringFunction = (fn) => {
    const cache = /* @__PURE__ */ Object.create(null);
    return (str) => {
      const hit = cache[str];
      return hit || (cache[str] = fn(str));
    };
  };
  var camelizeRE = /-(\w)/g;
  var camelize = cacheStringFunction((str) => {
    return str.replace(camelizeRE, (_, c) => c ? c.toUpperCase() : "");
  });
  var hyphenateRE = /\B([A-Z])/g;
  var hyphenate = cacheStringFunction((str) => str.replace(hyphenateRE, "-$1").toLowerCase());
  var capitalize = cacheStringFunction((str) => str.charAt(0).toUpperCase() + str.slice(1));
  var toHandlerKey = cacheStringFunction((str) => str ? `on${capitalize(str)}` : ``);
  var hasChanged = (value, oldValue) => !Object.is(value, oldValue);

  // node_modules/@vue/reactivity/dist/reactivity.esm-bundler.js
  function warn(msg, ...args) {
    console.warn(`[Vue warn] ${msg}`, ...args);
  }
  var createDep = (effects) => {
    const dep = new Set(effects);
    dep.w = 0;
    dep.n = 0;
    return dep;
  };
  var wasTracked = (dep) => (dep.w & trackOpBit) > 0;
  var newTracked = (dep) => (dep.n & trackOpBit) > 0;
  var targetMap = /* @__PURE__ */ new WeakMap();
  var effectTrackDepth = 0;
  var trackOpBit = 1;
  var maxMarkerBits = 30;
  var activeEffect;
  var ITERATE_KEY = Symbol(true ? "iterate" : "");
  var MAP_KEY_ITERATE_KEY = Symbol(true ? "Map key iterate" : "");
  var shouldTrack = true;
  var trackStack = [];
  function pauseTracking() {
    trackStack.push(shouldTrack);
    shouldTrack = false;
  }
  function resetTracking() {
    const last = trackStack.pop();
    shouldTrack = last === void 0 ? true : last;
  }
  function track(target, type, key) {
    if (shouldTrack && activeEffect) {
      let depsMap = targetMap.get(target);
      if (!depsMap) {
        targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
      }
      let dep = depsMap.get(key);
      if (!dep) {
        depsMap.set(key, dep = createDep());
      }
      const eventInfo = true ? { effect: activeEffect, target, type, key } : void 0;
      trackEffects(dep, eventInfo);
    }
  }
  function trackEffects(dep, debuggerEventExtraInfo) {
    let shouldTrack2 = false;
    if (effectTrackDepth <= maxMarkerBits) {
      if (!newTracked(dep)) {
        dep.n |= trackOpBit;
        shouldTrack2 = !wasTracked(dep);
      }
    } else {
      shouldTrack2 = !dep.has(activeEffect);
    }
    if (shouldTrack2) {
      dep.add(activeEffect);
      activeEffect.deps.push(dep);
      if (activeEffect.onTrack) {
        activeEffect.onTrack(Object.assign({ effect: activeEffect }, debuggerEventExtraInfo));
      }
    }
  }
  function trigger(target, type, key, newValue, oldValue, oldTarget) {
    const depsMap = targetMap.get(target);
    if (!depsMap) {
      return;
    }
    let deps = [];
    if (type === "clear") {
      deps = [...depsMap.values()];
    } else if (key === "length" && isArray(target)) {
      depsMap.forEach((dep, key2) => {
        if (key2 === "length" || key2 >= newValue) {
          deps.push(dep);
        }
      });
    } else {
      if (key !== void 0) {
        deps.push(depsMap.get(key));
      }
      switch (type) {
        case "add":
          if (!isArray(target)) {
            deps.push(depsMap.get(ITERATE_KEY));
            if (isMap(target)) {
              deps.push(depsMap.get(MAP_KEY_ITERATE_KEY));
            }
          } else if (isIntegerKey(key)) {
            deps.push(depsMap.get("length"));
          }
          break;
        case "delete":
          if (!isArray(target)) {
            deps.push(depsMap.get(ITERATE_KEY));
            if (isMap(target)) {
              deps.push(depsMap.get(MAP_KEY_ITERATE_KEY));
            }
          }
          break;
        case "set":
          if (isMap(target)) {
            deps.push(depsMap.get(ITERATE_KEY));
          }
          break;
      }
    }
    const eventInfo = true ? { target, type, key, newValue, oldValue, oldTarget } : void 0;
    if (deps.length === 1) {
      if (deps[0]) {
        if (true) {
          triggerEffects(deps[0], eventInfo);
        } else {
          triggerEffects(deps[0]);
        }
      }
    } else {
      const effects = [];
      for (const dep of deps) {
        if (dep) {
          effects.push(...dep);
        }
      }
      if (true) {
        triggerEffects(createDep(effects), eventInfo);
      } else {
        triggerEffects(createDep(effects));
      }
    }
  }
  function triggerEffects(dep, debuggerEventExtraInfo) {
    const effects = isArray(dep) ? dep : [...dep];
    for (const effect3 of effects) {
      if (effect3.computed) {
        triggerEffect(effect3, debuggerEventExtraInfo);
      }
    }
    for (const effect3 of effects) {
      if (!effect3.computed) {
        triggerEffect(effect3, debuggerEventExtraInfo);
      }
    }
  }
  function triggerEffect(effect3, debuggerEventExtraInfo) {
    if (effect3 !== activeEffect || effect3.allowRecurse) {
      if (effect3.onTrigger) {
        effect3.onTrigger(extend({ effect: effect3 }, debuggerEventExtraInfo));
      }
      if (effect3.scheduler) {
        effect3.scheduler();
      } else {
        effect3.run();
      }
    }
  }
  var isNonTrackableKeys = /* @__PURE__ */ makeMap(`__proto__,__v_isRef,__isVue`);
  var builtInSymbols = new Set(
    /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((key) => key !== "arguments" && key !== "caller").map((key) => Symbol[key]).filter(isSymbol)
  );
  var get = /* @__PURE__ */ createGetter();
  var readonlyGet = /* @__PURE__ */ createGetter(true);
  var arrayInstrumentations = /* @__PURE__ */ createArrayInstrumentations();
  function createArrayInstrumentations() {
    const instrumentations = {};
    ["includes", "indexOf", "lastIndexOf"].forEach((key) => {
      instrumentations[key] = function(...args) {
        const arr = toRaw(this);
        for (let i = 0, l = this.length; i < l; i++) {
          track(arr, "get", i + "");
        }
        const res = arr[key](...args);
        if (res === -1 || res === false) {
          return arr[key](...args.map(toRaw));
        } else {
          return res;
        }
      };
    });
    ["push", "pop", "shift", "unshift", "splice"].forEach((key) => {
      instrumentations[key] = function(...args) {
        pauseTracking();
        const res = toRaw(this)[key].apply(this, args);
        resetTracking();
        return res;
      };
    });
    return instrumentations;
  }
  function createGetter(isReadonly2 = false, shallow = false) {
    return function get2(target, key, receiver) {
      if (key === "__v_isReactive") {
        return !isReadonly2;
      } else if (key === "__v_isReadonly") {
        return isReadonly2;
      } else if (key === "__v_isShallow") {
        return shallow;
      } else if (key === "__v_raw" && receiver === (isReadonly2 ? shallow ? shallowReadonlyMap : readonlyMap : shallow ? shallowReactiveMap : reactiveMap).get(target)) {
        return target;
      }
      const targetIsArray = isArray(target);
      if (!isReadonly2 && targetIsArray && hasOwn(arrayInstrumentations, key)) {
        return Reflect.get(arrayInstrumentations, key, receiver);
      }
      const res = Reflect.get(target, key, receiver);
      if (isSymbol(key) ? builtInSymbols.has(key) : isNonTrackableKeys(key)) {
        return res;
      }
      if (!isReadonly2) {
        track(target, "get", key);
      }
      if (shallow) {
        return res;
      }
      if (isRef(res)) {
        return targetIsArray && isIntegerKey(key) ? res : res.value;
      }
      if (isObject(res)) {
        return isReadonly2 ? readonly(res) : reactive(res);
      }
      return res;
    };
  }
  var set = /* @__PURE__ */ createSetter();
  function createSetter(shallow = false) {
    return function set2(target, key, value, receiver) {
      let oldValue = target[key];
      if (isReadonly(oldValue) && isRef(oldValue) && !isRef(value)) {
        return false;
      }
      if (!shallow && !isReadonly(value)) {
        if (!isShallow(value)) {
          value = toRaw(value);
          oldValue = toRaw(oldValue);
        }
        if (!isArray(target) && isRef(oldValue) && !isRef(value)) {
          oldValue.value = value;
          return true;
        }
      }
      const hadKey = isArray(target) && isIntegerKey(key) ? Number(key) < target.length : hasOwn(target, key);
      const result = Reflect.set(target, key, value, receiver);
      if (target === toRaw(receiver)) {
        if (!hadKey) {
          trigger(target, "add", key, value);
        } else if (hasChanged(value, oldValue)) {
          trigger(target, "set", key, value, oldValue);
        }
      }
      return result;
    };
  }
  function deleteProperty(target, key) {
    const hadKey = hasOwn(target, key);
    const oldValue = target[key];
    const result = Reflect.deleteProperty(target, key);
    if (result && hadKey) {
      trigger(target, "delete", key, void 0, oldValue);
    }
    return result;
  }
  function has(target, key) {
    const result = Reflect.has(target, key);
    if (!isSymbol(key) || !builtInSymbols.has(key)) {
      track(target, "has", key);
    }
    return result;
  }
  function ownKeys(target) {
    track(target, "iterate", isArray(target) ? "length" : ITERATE_KEY);
    return Reflect.ownKeys(target);
  }
  var mutableHandlers = {
    get,
    set,
    deleteProperty,
    has,
    ownKeys
  };
  var readonlyHandlers = {
    get: readonlyGet,
    set(target, key) {
      if (true) {
        warn(`Set operation on key "${String(key)}" failed: target is readonly.`, target);
      }
      return true;
    },
    deleteProperty(target, key) {
      if (true) {
        warn(`Delete operation on key "${String(key)}" failed: target is readonly.`, target);
      }
      return true;
    }
  };
  var toShallow = (value) => value;
  var getProto = (v) => Reflect.getPrototypeOf(v);
  function get$1(target, key, isReadonly2 = false, isShallow2 = false) {
    target = target["__v_raw"];
    const rawTarget = toRaw(target);
    const rawKey = toRaw(key);
    if (!isReadonly2) {
      if (key !== rawKey) {
        track(rawTarget, "get", key);
      }
      track(rawTarget, "get", rawKey);
    }
    const { has: has2 } = getProto(rawTarget);
    const wrap = isShallow2 ? toShallow : isReadonly2 ? toReadonly : toReactive;
    if (has2.call(rawTarget, key)) {
      return wrap(target.get(key));
    } else if (has2.call(rawTarget, rawKey)) {
      return wrap(target.get(rawKey));
    } else if (target !== rawTarget) {
      target.get(key);
    }
  }
  function has$1(key, isReadonly2 = false) {
    const target = this["__v_raw"];
    const rawTarget = toRaw(target);
    const rawKey = toRaw(key);
    if (!isReadonly2) {
      if (key !== rawKey) {
        track(rawTarget, "has", key);
      }
      track(rawTarget, "has", rawKey);
    }
    return key === rawKey ? target.has(key) : target.has(key) || target.has(rawKey);
  }
  function size(target, isReadonly2 = false) {
    target = target["__v_raw"];
    !isReadonly2 && track(toRaw(target), "iterate", ITERATE_KEY);
    return Reflect.get(target, "size", target);
  }
  function add(value) {
    value = toRaw(value);
    const target = toRaw(this);
    const proto = getProto(target);
    const hadKey = proto.has.call(target, value);
    if (!hadKey) {
      target.add(value);
      trigger(target, "add", value, value);
    }
    return this;
  }
  function set$1(key, value) {
    value = toRaw(value);
    const target = toRaw(this);
    const { has: has2, get: get2 } = getProto(target);
    let hadKey = has2.call(target, key);
    if (!hadKey) {
      key = toRaw(key);
      hadKey = has2.call(target, key);
    } else if (true) {
      checkIdentityKeys(target, has2, key);
    }
    const oldValue = get2.call(target, key);
    target.set(key, value);
    if (!hadKey) {
      trigger(target, "add", key, value);
    } else if (hasChanged(value, oldValue)) {
      trigger(target, "set", key, value, oldValue);
    }
    return this;
  }
  function deleteEntry(key) {
    const target = toRaw(this);
    const { has: has2, get: get2 } = getProto(target);
    let hadKey = has2.call(target, key);
    if (!hadKey) {
      key = toRaw(key);
      hadKey = has2.call(target, key);
    } else if (true) {
      checkIdentityKeys(target, has2, key);
    }
    const oldValue = get2 ? get2.call(target, key) : void 0;
    const result = target.delete(key);
    if (hadKey) {
      trigger(target, "delete", key, void 0, oldValue);
    }
    return result;
  }
  function clear() {
    const target = toRaw(this);
    const hadItems = target.size !== 0;
    const oldTarget = true ? isMap(target) ? new Map(target) : new Set(target) : void 0;
    const result = target.clear();
    if (hadItems) {
      trigger(target, "clear", void 0, void 0, oldTarget);
    }
    return result;
  }
  function createForEach(isReadonly2, isShallow2) {
    return function forEach(callback, thisArg) {
      const observed = this;
      const target = observed["__v_raw"];
      const rawTarget = toRaw(target);
      const wrap = isShallow2 ? toShallow : isReadonly2 ? toReadonly : toReactive;
      !isReadonly2 && track(rawTarget, "iterate", ITERATE_KEY);
      return target.forEach((value, key) => {
        return callback.call(thisArg, wrap(value), wrap(key), observed);
      });
    };
  }
  function createIterableMethod(method, isReadonly2, isShallow2) {
    return function(...args) {
      const target = this["__v_raw"];
      const rawTarget = toRaw(target);
      const targetIsMap = isMap(rawTarget);
      const isPair = method === "entries" || method === Symbol.iterator && targetIsMap;
      const isKeyOnly = method === "keys" && targetIsMap;
      const innerIterator = target[method](...args);
      const wrap = isShallow2 ? toShallow : isReadonly2 ? toReadonly : toReactive;
      !isReadonly2 && track(rawTarget, "iterate", isKeyOnly ? MAP_KEY_ITERATE_KEY : ITERATE_KEY);
      return {
        next() {
          const { value, done } = innerIterator.next();
          return done ? { value, done } : {
            value: isPair ? [wrap(value[0]), wrap(value[1])] : wrap(value),
            done
          };
        },
        [Symbol.iterator]() {
          return this;
        }
      };
    };
  }
  function createReadonlyMethod(type) {
    return function(...args) {
      if (true) {
        const key = args[0] ? `on key "${args[0]}" ` : ``;
        console.warn(`${capitalize(type)} operation ${key}failed: target is readonly.`, toRaw(this));
      }
      return type === "delete" ? false : this;
    };
  }
  function createInstrumentations() {
    const mutableInstrumentations2 = {
      get(key) {
        return get$1(this, key);
      },
      get size() {
        return size(this);
      },
      has: has$1,
      add,
      set: set$1,
      delete: deleteEntry,
      clear,
      forEach: createForEach(false, false)
    };
    const shallowInstrumentations2 = {
      get(key) {
        return get$1(this, key, false, true);
      },
      get size() {
        return size(this);
      },
      has: has$1,
      add,
      set: set$1,
      delete: deleteEntry,
      clear,
      forEach: createForEach(false, true)
    };
    const readonlyInstrumentations2 = {
      get(key) {
        return get$1(this, key, true);
      },
      get size() {
        return size(this, true);
      },
      has(key) {
        return has$1.call(this, key, true);
      },
      add: createReadonlyMethod("add"),
      set: createReadonlyMethod("set"),
      delete: createReadonlyMethod("delete"),
      clear: createReadonlyMethod("clear"),
      forEach: createForEach(true, false)
    };
    const shallowReadonlyInstrumentations2 = {
      get(key) {
        return get$1(this, key, true, true);
      },
      get size() {
        return size(this, true);
      },
      has(key) {
        return has$1.call(this, key, true);
      },
      add: createReadonlyMethod("add"),
      set: createReadonlyMethod("set"),
      delete: createReadonlyMethod("delete"),
      clear: createReadonlyMethod("clear"),
      forEach: createForEach(true, true)
    };
    const iteratorMethods = ["keys", "values", "entries", Symbol.iterator];
    iteratorMethods.forEach((method) => {
      mutableInstrumentations2[method] = createIterableMethod(method, false, false);
      readonlyInstrumentations2[method] = createIterableMethod(method, true, false);
      shallowInstrumentations2[method] = createIterableMethod(method, false, true);
      shallowReadonlyInstrumentations2[method] = createIterableMethod(method, true, true);
    });
    return [
      mutableInstrumentations2,
      readonlyInstrumentations2,
      shallowInstrumentations2,
      shallowReadonlyInstrumentations2
    ];
  }
  var [mutableInstrumentations, readonlyInstrumentations, shallowInstrumentations, shallowReadonlyInstrumentations] = /* @__PURE__ */ createInstrumentations();
  function createInstrumentationGetter(isReadonly2, shallow) {
    const instrumentations = shallow ? isReadonly2 ? shallowReadonlyInstrumentations : shallowInstrumentations : isReadonly2 ? readonlyInstrumentations : mutableInstrumentations;
    return (target, key, receiver) => {
      if (key === "__v_isReactive") {
        return !isReadonly2;
      } else if (key === "__v_isReadonly") {
        return isReadonly2;
      } else if (key === "__v_raw") {
        return target;
      }
      return Reflect.get(hasOwn(instrumentations, key) && key in target ? instrumentations : target, key, receiver);
    };
  }
  var mutableCollectionHandlers = {
    get: /* @__PURE__ */ createInstrumentationGetter(false, false)
  };
  var readonlyCollectionHandlers = {
    get: /* @__PURE__ */ createInstrumentationGetter(true, false)
  };
  function checkIdentityKeys(target, has2, key) {
    const rawKey = toRaw(key);
    if (rawKey !== key && has2.call(target, rawKey)) {
      const type = toRawType(target);
      console.warn(`Reactive ${type} contains both the raw and reactive versions of the same object${type === `Map` ? ` as keys` : ``}, which can lead to inconsistencies. Avoid differentiating between the raw and reactive versions of an object and only use the reactive version if possible.`);
    }
  }
  var reactiveMap = /* @__PURE__ */ new WeakMap();
  var shallowReactiveMap = /* @__PURE__ */ new WeakMap();
  var readonlyMap = /* @__PURE__ */ new WeakMap();
  var shallowReadonlyMap = /* @__PURE__ */ new WeakMap();
  function targetTypeMap(rawType) {
    switch (rawType) {
      case "Object":
      case "Array":
        return 1;
      case "Map":
      case "Set":
      case "WeakMap":
      case "WeakSet":
        return 2;
      default:
        return 0;
    }
  }
  function getTargetType(value) {
    return value["__v_skip"] || !Object.isExtensible(value) ? 0 : targetTypeMap(toRawType(value));
  }
  function reactive(target) {
    if (isReadonly(target)) {
      return target;
    }
    return createReactiveObject(target, false, mutableHandlers, mutableCollectionHandlers, reactiveMap);
  }
  function readonly(target) {
    return createReactiveObject(target, true, readonlyHandlers, readonlyCollectionHandlers, readonlyMap);
  }
  function createReactiveObject(target, isReadonly2, baseHandlers, collectionHandlers, proxyMap) {
    if (!isObject(target)) {
      if (true) {
        console.warn(`value cannot be made reactive: ${String(target)}`);
      }
      return target;
    }
    if (target["__v_raw"] && !(isReadonly2 && target["__v_isReactive"])) {
      return target;
    }
    const existingProxy = proxyMap.get(target);
    if (existingProxy) {
      return existingProxy;
    }
    const targetType = getTargetType(target);
    if (targetType === 0) {
      return target;
    }
    const proxy = new Proxy(target, targetType === 2 ? collectionHandlers : baseHandlers);
    proxyMap.set(target, proxy);
    return proxy;
  }
  function isReadonly(value) {
    return !!(value && value["__v_isReadonly"]);
  }
  function isShallow(value) {
    return !!(value && value["__v_isShallow"]);
  }
  function toRaw(observed) {
    const raw = observed && observed["__v_raw"];
    return raw ? toRaw(raw) : observed;
  }
  var toReactive = (value) => isObject(value) ? reactive(value) : value;
  var toReadonly = (value) => isObject(value) ? readonly(value) : value;
  function isRef(r) {
    return !!(r && r.__v_isRef === true);
  }
  var _a;
  _a = "__v_isReadonly";

  // js/index.js
  var reactive2 = reactive;
  var toRaw2 = toRaw;
  var store = /* @__PURE__ */ new Map();
  window.synthesize = synthesize;
  document.addEventListener("alpine:init", () => {
    reactive2 = window.Alpine.reactive;
    toRaw2 = window.Alpine.raw;
  });
  function getCsrfToken() {
    if (document.querySelector('meta[name="csrf"]')) {
      return document.querySelector('meta[name="csrf"]').content;
    }
    return window.__csrf;
  }
  function overrideReactivity(r, e, tr) {
    reactive2 = r;
    effect = e;
    toRaw2 = tr;
    return synthesize;
  }
  function synthesize({ snapshot, effects }) {
    snapshot = toRaw2(snapshot);
    effects = toRaw2(effects);
    let symbol = Symbol();
    let target = {
      effects,
      snapshot,
      loading: reactive2({ state: false }),
      dirty: reactive2({ state: false }),
      errors: reactive2({ state: {} })
    };
    store.set(symbol, target);
    let canonical = extractData(deepClone(snapshot.data), symbol);
    let ephemeral = extractDataAndDecorate(deepClone(snapshot.data), symbol);
    target.canonical = canonical;
    target.ephemeral = ephemeral;
    target.reactive = reactive2(ephemeral);
    return target.reactive;
  }
  function extractDataAndDecorate(payload, symbol) {
    return extractData(payload, symbol, (value, meta, symbol2, path) => {
      let thing = decorate(value, {
        get $loading() {
          return store.get(symbol2).loading.state;
        },
        get $dirty() {
          return !deeplyEqual(
            dataGet(store.get(symbol2).reactive, path),
            dataGet(store.get(symbol2).canonical, path)
          );
        },
        get $errors() {
          let errors = {};
          Object.entries(store.get(symbol2).errors.state).forEach(([key, value2]) => {
            errors[key] = value2[0];
          });
          return errors;
        },
        __get(property) {
          if (typeof property === "symbol")
            return;
          if ([
            "__v_isRef",
            "__v_isReadonly",
            "__v_raw",
            "__v_skip",
            "toJSON",
            "then",
            "_x_interceptor",
            "init"
          ].includes(property))
            return;
          let effects = store.get(symbol2).effects[path];
          let methods = effects["methods"] || [];
          for (let i = 0; i < methods.length; i++) {
            if (methods[i][0] === property) {
              let func = new Function([], "return " + methods[i][1]);
              let boundFunc = func.bind(dataGet(store.get(symbol2).reactive, path));
              return boundFunc();
            }
          }
          let method = property;
          return async (...params) => {
            return await callMethod(symbol2, path, method, params);
          };
        }
      });
      return thing;
    });
  }
  function extractData(payload, symbol, decorate2 = (i) => i, path = "") {
    let value = isSynthetic(payload) ? payload[0] : payload;
    let meta = isSynthetic(payload) ? payload[1] : void 0;
    if (isObjecty(value)) {
      Object.entries(value).forEach(([key, iValue]) => {
        value[key] = extractData(iValue, symbol, decorate2, path === "" ? key : `${path}.${key}`);
      });
    }
    return meta !== void 0 ? decorate2(value, meta, symbol, path) : value;
  }
  function isSynthetic(payload) {
    return Array.isArray(payload) && payload.length === 2 && typeof payload[1] === "object" && Object.keys(payload[1]).includes("s");
  }
  async function callMethod(symbol, path, method, params) {
    let result = await requestMethodCall(symbol, path, method, params);
    return result;
  }
  var requestTargetQueue = /* @__PURE__ */ new Map();
  function requestMethodCall(symbol, path, method, params) {
    if (!requestTargetQueue.has(symbol)) {
      requestTargetQueue.set(symbol, { calls: [], receivers: [] });
    }
    triggerSend();
    return new Promise((resolve, reject) => {
      let queue = requestTargetQueue.get(symbol);
      queue.calls.push({
        path,
        method,
        params,
        handleReturn(value) {
          resolve(value);
        },
        handleError(value) {
          reject(value);
        }
      });
    });
  }
  var requestBufferTimeout;
  function triggerSend() {
    if (requestBufferTimeout)
      return;
    requestBufferTimeout = setTimeout(() => {
      sendMethodCall();
      requestBufferTimeout = void 0;
    }, 5);
  }
  async function sendMethodCall() {
    let payload = [];
    let receivers = [];
    requestTargetQueue.forEach((request2, symbol) => {
      let target = store.get(symbol);
      let propertiesDiff = diff(target.canonical, target.ephemeral);
      payload.push({
        snapshot: target.snapshot,
        diff: propertiesDiff,
        calls: request2.calls.map((i) => ({
          path: i.path,
          method: i.method,
          params: i.params
        }))
      });
      target.loading.state = true;
      receivers.push((snapshot, effects) => {
        mergeNewSnapshot(symbol, snapshot, effects);
        for (let i = 0; i < effects.returns.length; i++) {
          request2.calls[i].handleReturn(effects.returns[i]);
        }
        if (effects[""]["html"]) {
          Alpine.morph(document.getElementById(effects[""]["id"]), effects[""]["html"]);
        }
        target.errors.state = effects.errors;
        target.loading.state = false;
      });
    });
    requestTargetQueue.clear();
    let request = await fetch("/synthetic/update", {
      method: "POST",
      body: JSON.stringify({
        _token: getCsrfToken(),
        targets: payload
      }),
      headers: { "Content-type": "application/json" }
    });
    if (request.ok) {
      let response = await request.json();
      for (let i = 0; i < response.length; i++) {
        let { snapshot, effects } = response[i];
        receivers[i](snapshot, effects);
      }
    } else {
      let html = await request.text();
      showHtmlModal(html);
    }
  }
  function diff(left, right, diffs = {}, path = "") {
    if (left === right)
      return diffs;
    if (typeof left !== typeof right || isObject2(left) && isArray2(right) || isArray2(left) && isObject2(right)) {
      diffs[path] = right;
      return diffs;
    }
    if (isLeafy(left) || isLeafy(right)) {
      diffs[path] = right;
      return diffs;
    }
    let leftKeys = Object.keys(left);
    Object.entries(right).forEach(([key, value]) => {
      diffs = { ...diffs, ...diff(left[key], right[key], diffs, path === "" ? key : `${path}.${key}`) };
      leftKeys = leftKeys.filter((i) => i !== key);
    });
    leftKeys.forEach((key) => {
      diffs[`${path}.${key}`] = "__rm__";
    });
    return diffs;
  }
  function isLeafy(subject) {
    return typeof subject !== "object" || subject === null;
  }
  function deeplyEqual(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
  }
  function isObjecty(subject) {
    return typeof subject === "object" && subject !== null;
  }
  function isObject2(subject) {
    return isObjecty(subject) && !isArray2(subject);
  }
  function isArray2(subject) {
    return Array.isArray(subject);
  }
  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }
  function mergeNewSnapshot(symbol, snapshot, effects) {
    let target = store.get(symbol);
    target.snapshot = snapshot;
    target.effects = effects;
    target.canonical = extractData(deepClone(snapshot.data), symbol);
    let newData = extractData(deepClone(snapshot.data), symbol);
    Object.entries(target.ephemeral).forEach(([key, value]) => {
      if (JSON.stringify(target.ephemeral[key]) !== JSON.stringify(newData[key])) {
        target.reactive[key] = newData[key];
      }
    });
  }
  function decorate(object, decorator) {
    return new Proxy(object, {
      get(target, property, receiver) {
        if (property === "__target")
          return target;
        let got = Reflect.get(decorator, property, receiver);
        if (got !== void 0)
          return got;
        got = Reflect.get(target, property, receiver);
        if (got !== void 0)
          return got;
        if ("__get" in decorator) {
          return decorator.__get(property);
        }
      },
      set(target, property, value) {
        if (property in decorator) {
          decorator[property] = value;
        } else if (property in target || property === "__v_isRef") {
          target[property] = value;
        } else if ("__set" in decorator && !["then"].includes(property)) {
          decorator.__set(property, value);
        }
        return true;
      }
    });
  }
  function dataGet(object, key) {
    if (key === "")
      return object;
    return key.split(".").reduce((carry, i) => {
      if (carry === void 0)
        return void 0;
      return carry[i];
    }, object);
  }
  function showHtmlModal(html) {
    let page = document.createElement("html");
    page.innerHTML = html;
    page.querySelectorAll("a").forEach(
      (a) => a.setAttribute("target", "_top")
    );
    let modal = document.getElementById("livewire-error");
    if (typeof modal != "undefined" && modal != null) {
      modal.innerHTML = "";
    } else {
      modal = document.createElement("div");
      modal.id = "livewire-error";
      modal.style.position = "fixed";
      modal.style.width = "100vw";
      modal.style.height = "100vh";
      modal.style.padding = "50px";
      modal.style.backgroundColor = "rgba(0, 0, 0, .6)";
      modal.style.zIndex = 2e5;
    }
    let iframe = document.createElement("iframe");
    iframe.style.backgroundColor = "#17161A";
    iframe.style.borderRadius = "5px";
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    modal.appendChild(iframe);
    document.body.prepend(modal);
    document.body.style.overflow = "hidden";
    iframe.contentWindow.document.open();
    iframe.contentWindow.document.write(page.outerHTML);
    iframe.contentWindow.document.close();
    modal.addEventListener("click", () => hideHtmlModal(modal));
    modal.setAttribute("tabindex", 0);
    modal.addEventListener("keydown", (e) => {
      if (e.key === "Escape")
        hideHtmlModal(modal);
    });
    modal.focus();
  }
  function hideHtmlModal(modal) {
    modal.outerHTML = "";
    document.body.style.overflow = "visible";
  }
})();
