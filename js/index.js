import { reactive as r, effect as e, toRaw as tr, stop as s, pauseTracking, enableTracking } from '@vue/reactivity'
import { each, deeplyEqual, isObjecty, deepClone, diff, dataGet } from './utils'
import { showHtmlModal } from './modal'
import { trigger } from './events'

/**
 * The Alpine build will need to use it's own reactivity hooks,
 * so we'll declare these as variables rather than direct imports.
 */
export let reactive = r
export let release = s
export let effect = e
export let raw = tr

document.addEventListener('alpine:init', () => {
    reactive = Alpine.reactive
    effect = Alpine.effect
    release = Alpine.release
    raw = Alpine.raw
})

/**
 * Fire up all the plugin-like features...
 */
import './features'

/**
 * We'll store all our "synthetic" instances in a single lookup so that
 * we can pass around an identifier, rather than the actual instance.
 */
let store = new Map

/**
 * This is the single entrypoint into "synthetic". Users can pass
 * either a full snapshot, rendered on the backend, or they can
 * pass a string identifier and request a snapshot via fetch.
 */
window.synthetic = synthetic

export function synthetic(provided) {
    if (typeof provided === 'string') return newUp(provided)

    // This "target" will be the object representing all the state for this synthetic.
    // Anytime you need to interect with this synthetic, you will need this object.
    let target = {
        effects: raw(provided.effects),
        snapshot: raw(provided.snapshot),
    }

    // These will be used as an identifier in a lookup for this synthetic.
    let symbol = Symbol()
    store.set(symbol, target)

    // "canonical" data represents the last known server state.
    let canonical = extractData(deepClone(target.snapshot.data), symbol)
    // "ephemeral" represents the most current state. (This can be freely manipulated by end users)
    let ephemeral = extractDataAndDecorate(deepClone(target.snapshot.data), symbol)

    target.canonical = canonical
    target.ephemeral = ephemeral
    // "reactive" is just ephemeral, except when you mutate it, front-ends like Vue react.
    target.reactive = reactive(ephemeral)

    trigger('new', target)

    // Effects will be processed after every request, but we'll also handle them on initialization.
    processEffects(target)

    return target.reactive
}

/**
 * This is kind of like "lazy loading" a synthetic.
 * For environments like pure-SPAs where you can't generate
 * an initial synthetic snapshot on the server this is necessary.
 */
async function newUp(name) {
    return synthetic(await requestNew(name))
}

/**
 * This is where we add special behavior (deeply) to the synthetic objects
 * that users interact with. Things like "post.$errors" & "form.$loading"
 */
function extractDataAndDecorate(payload, symbol) {
    return extractData(payload, symbol, (value, meta, symbol, path) => {
        let target = store.get(symbol)

        let finish = trigger('decorate', target, path)

        return decorate(value, finish({
            $watch(path, callback) {
                let firstTime = true
                let old = undefined

                effect(() => {
                    let value = dataGet(target.reactive, path)

                    if (firstTime) {
                        firstTime = false
                        return
                    }

                    pauseTracking()

                    callback(value, old)

                    old = value

                    enableTracking()
                })
            },

            $watchEffect(callback) {
                effect(callback)
            },

            async $commit() {
                return await requestCommit(symbol)
            },

            __get(property) {
                // This is a "magic" getter (like in PHP). It acts as a trap for any property
                // or method that is being accessed, but doesn't exist. We're using it here
                // to call server methods without the knowledge of their names beforehand.

                // First we'll ignore any properties that will be accessed but we don't care about.
                if (typeof property === 'symbol') return
                if ([
                    '__v_isRef', '__v_isReadonly', '__v_raw', '__v_skip', 'toJSON', 'then', '_x_interceptor', 'init',
                ].includes(property)) return

                // We will assume the user wants to call a method
                // on the component who's name we don't know.
                let method = property

                return async (...params) => {
                    return await callMethod(symbol, path, method, params)
                }
            }
        }))
    })
}

/**
 * The data that's passed between the browser and server is in the form of
 * nested tuples consisting of the schema: [rawValue, metadata]. In this
 * method we're extracting the plain JS object of only the raw values.
 */
function extractData(payload, symbol, decorate = i => i, path = '') {
    let value = isSynthetic(payload) ? payload[0] : payload
    let meta = isSynthetic(payload) ? payload[1] : undefined

    if (isObjecty(value)) {
        Object.entries(value).forEach(([key, iValue]) => {
            value[key] = extractData(iValue, symbol, decorate, path === '' ? key : `${path}.${key}`)
        })
    }

    return (meta !== undefined && isObjecty(value))
        ? decorate(value, meta, symbol, path)
        : value
}

/**
 * Determine if the variable passed in is a node in a nested metadata
 * tuple tree. (Meaning it takes the form of: [rawData, metadata])
 */
function isSynthetic(subject) {
    return Array.isArray(subject)
        && subject.length === 2
        && typeof subject[1] === 'object'
        && Object.keys(subject[1]).includes('s')
}

async function callMethod(symbol, path, method, params) {
    let result = await requestMethodCall(symbol, path, method, params)

    return result
}

let requestTargetQueue = new Map

function requestMethodCall(symbol, path, method, params) {
    requestCommit(symbol)

    return new Promise((resolve, reject) => {
        let queue = requestTargetQueue.get(symbol)

        queue.calls.push({
            path,
            method,
            params,
            handleReturn(value) {
                resolve(value)
            },
        })
    })
}

/**
 * The term "commit" here refers to anytime we're making a network
 * request, updating the server, and generating a new snapshot.
 * We're "requesting" a new commit rather than executing it
 * immediately, because we might want to batch multiple
 * simultaneus commits from other synthetic targets.
 */
function requestCommit(symbol) {
    if (! requestTargetQueue.has(symbol)) {
        requestTargetQueue.set(symbol, { calls: [], receivers: [] })
    }

    triggerSend()

    return new Promise((resolve, reject) => {
        let queue = requestTargetQueue.get(symbol)

        queue.handleResponse = () => resolve()
    })
}

let requestBufferTimeout

/**
 * This is sort of "debounce" so that multiple
 * network requests can be bundled together.
 */
function triggerSend() {
    if (requestBufferTimeout) return

    requestBufferTimeout = setTimeout(() => {
        sendMethodCall()

        requestBufferTimeout = undefined
    }, 5)
}

/**
 * This method prepares the network request payload and makes
 * the actual request to the server to update the target,
 * store a new snapshot, and handle any side effects.
 */
async function sendMethodCall() {
    let payload = []
    let receivers = []

    requestTargetQueue.forEach((request, symbol) => {
        let target = store.get(symbol)

        let propertiesDiff = diff(target.canonical, target.ephemeral)

        let targetPaylaod = {
            snapshot: target.snapshot,
            diff: propertiesDiff,
            calls: request.calls.map(i => ({
                path: i.path,
                method: i.method,
                params: i.params,
            }))
        }

        payload.push(targetPaylaod)

        let finish = trigger('request', target, targetPaylaod)

        receivers.push((snapshot, effects) => {
            mergeNewSnapshot(symbol, snapshot, effects)

            processEffects(target)

            for (let i = 0; i < request.calls.length; i++) {
                let { path, handleReturn } = request.calls[i];

                let forReturn = undefined

                if (effects) Object.entries(effects).forEach(([iPath, iEffects]) => {
                    if (path === iPath) {
                        if (iEffects['return'] !== undefined) forReturn = iEffects['return']
                    }
                })

                handleReturn(forReturn)
            }

            finish()

            request.handleResponse()
        })
    })

    requestTargetQueue.clear()

    let request = await fetch('/synthetic/update', {
        method: 'POST',
        body: JSON.stringify({
            _token: getCsrfToken(),
            targets: payload,
        }),
        headers: {'Content-type': 'application/json'},
    })

    if (request.ok) {
        let response = await request.json()

        for (let i = 0; i < response.length; i++) {
            let { snapshot, effects } = response[i];

            receivers[i](snapshot, effects)
        }
    } else {
        let html = await request.text()

        showHtmlModal(html)
    }
}

async function requestNew(name) {
    let request = await fetch('/synthetic/new', {
        method: 'POST',
        body: JSON.stringify({
            _token: getCsrfToken(),
            name: name,
        }),
        headers: {'Content-type': 'application/json'},
    })

    if (request.ok) {
        return  await request.json()
    } else {
        let html = await request.text()

        showHtmlModal(html)
    }
}

/**
 * Post requests in Laravel require a csrf token to be passed
 * along with the payload. Here, we'll try and locate one.
 */
function getCsrfToken() {
    if (document.querySelector('meta[name="csrf"]')) {
        return document.querySelector('meta[name="csrf"]').content
    }

    return window.__csrf
}

/**
 * Here we'll take the new state and side effects from the
 * server and use them to update the existing data that
 * users interact with, triggering reactive effects.
 */
function mergeNewSnapshot(symbol, snapshot, effects) {
    let target = store.get(symbol)

    target.snapshot = snapshot
    target.effects = effects
    target.canonical = extractData(deepClone(snapshot.data), symbol)

    let newData = extractData(deepClone(snapshot.data), symbol)

    Object.entries(target.ephemeral).forEach(([key, value]) => {
        if (! deeplyEqual(target.ephemeral[key], newData[key])) {
            target.reactive[key] = newData[key]
        }
    })
}

/**
 * This method decorates the target's raw data with new behavior.
 * We're using a proxy as a trap to intercept gets and sets.
 */
function decorate(object, decorator) {
    return new Proxy(object, {
        // These expose the decorator properties as enumerable and such
        // This is sometimes what you want and sometimes what you don't want
        // (in the case of JSON.stringify comparisons). For now. I don't want.
        // has(target, key) {
        //     return Reflect.has(decorator, key) || Reflect.has(target, key)
        // },

        // getOwnPropertyDescriptor(target, property) {
        //     return Reflect.getOwnPropertyDescriptor(decorator, property) || Reflect.getOwnPropertyDescriptor(target, property)
        // },

        // ownKeys(target) {
        //     return Array.from(new Set([...Reflect.ownKeys(decorator), ...Reflect.ownKeys(target)]))
        // },

        get(target, property, receiver) {
            if (property === '__target') return target
            if (property === '__decorator') return decorator

            let got = Reflect.get(decorator, property, receiver)
            if (got !== undefined) return got

            got = Reflect.get(target, property, receiver)
            if (got !== undefined) return got


            if ('__get' in decorator) {
                return decorator.__get(property)
            }
        },

        set(target, property, value) {
            if (property in decorator) {
                decorator[property] = value
            } else if (property in target || property === '__v_isRef') {
                target[property] = value
            } else if ('__set' in decorator && ! ['then'].includes(property)) {
                decorator.__set(property, value)
            }

            return true
        },
    })
}

function processEffects(target) {
    let effects = target.effects

    each(effects, (key, value) => trigger('effects', target, value, key))
}

// Leaving this here in case I determine that this is a better idea.
// function decorateWithoutProxy(object, symbol, path) {
//     let target = store.get(symbol)

//     let methods = target.methods[path] || []
//     let methodDescriptors = {}
//     methods.forEach(method => {
//         methodDescriptors[method] = { get() {
//             return async (...params) => {
//                 return await callMethod(symbol, path, method, params)
//             }
//         }}
//     })

//     Object.defineProperties(object, {
//         $commit: { value: () => {
//             //
//         }},

//         ...methodDescriptors
//     })
// }
