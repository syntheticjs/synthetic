import { reactive as r, effect as e, toRaw as tr } from '@vue/reactivity'

let reactive = r
// let effect = e
let toRaw = tr

let store = new Map

window.synthesize = synthesize

document.addEventListener('alpine:init', () => {
    reactive = window.Alpine.reactive
    toRaw = window.Alpine.raw
})

function getCsrfToken() {
    if (document.querySelector('meta[name="csrf"]')) {
        return document.querySelector('meta[name="csrf"]').content
    }

    return window.__csrf
}

export function overrideReactivity(r, e, tr) {
    reactive = r
    effect = e
    toRaw = tr

    return synthesize
}

export function synthesize({ snapshot, effects }) {
    snapshot = toRaw(snapshot)
    effects = toRaw(effects)
    let symbol = Symbol()

    let target = {
        effects,
        snapshot,
        loading: reactive({ state: false }),
        dirty: reactive({ state: false }),
        errors: reactive({ state: {} }),
    }

    store.set(symbol, target)

    let canonical = extractData(deepClone(snapshot.data), symbol)
    let ephemeral = extractDataAndDecorate(deepClone(snapshot.data), symbol)

    target.canonical = canonical
    target.ephemeral = ephemeral
    target.reactive = reactive(ephemeral)

    return target.reactive
}

function extractDataAndDecorate(payload, symbol) {
    return extractData(payload, symbol, (value, meta, symbol, path) => {
        let thing = decorate(value, {
            get $loading() {
                return store.get(symbol).loading.state
            },

            get $dirty() {
                return ! deeplyEqual(
                    dataGet(store.get(symbol).reactive, path),
                    dataGet(store.get(symbol).canonical, path)
                )
            },

            get $errors() {
                let errors = {}

                Object.entries(store.get(symbol).errors.state).forEach(([key, value]) => {
                    errors[key] = value[0]
                })

                return errors
            },

            __get(property) {
                if (typeof property === 'symbol') return
                if ([
                    '__v_isRef', '__v_isReadonly', '__v_raw', '__v_skip', 'toJSON', 'then', '_x_interceptor', 'init',
                ].includes(property)) return

                let effects = store.get(symbol).effects[path]
                let methods = effects['methods'] || []

                for (let i = 0; i < methods.length; i++) {
                    if (methods[i][0] === property) {
                        let func = new Function([], 'return '+methods[i][1])
                        let boundFunc = func.bind(dataGet(store.get(symbol).reactive, path))
                        return boundFunc()
                    }
                }

                // This is a magic getter. If there is no property,
                // then this trap will get called. In these cases
                // we will assume the user wants to call a method
                // on the component who's name we don't know.
                let method = property

                return async (...params) => {
                    return await callMethod(symbol, path, method, params)
                }
            }
        })

        return thing
    })
}

function extractData(payload, symbol, decorate = i => i, path = '') {
    let value = isSynthetic(payload) ? payload[0] : payload
    let meta = isSynthetic(payload) ? payload[1] : undefined

    if (isObjecty(value)) {
        Object.entries(value).forEach(([key, iValue]) => {
            value[key] = extractData(iValue, symbol, decorate, path === '' ? key : `${path}.${key}`)
        })
    }

    return meta !== undefined
        ? decorate(value, meta, symbol, path)
        : value
}

function decorateWithoutProxy(object, symbol, path) {
    let target = store.get(symbol)

    let methods = target.methods[path] || []
    let methodDescriptors = {}
    methods.forEach(method => {
        methodDescriptors[method] = { get() {
            return async (...params) => {
                return await callMethod(symbol, path, method, params)
            }
        }}
    })

    Object.defineProperties(object, {
        $loading: { get() {
            return target.loading.state
        }},
        $dirty: { get() {
            return (property) => {
                if (! property) {
                    return ! compare(dataGet(target.reactive, path), dataGet(target.canonical, path))
                }

                return ! compare(dataGet(target.reactive, path)[property], dataGet(target.canonical, path)[property])
            }
        }},
        $errors: { get() {
            let errors = {}

            Object.entries(target.errors.state).forEach(([key, value]) => {
                errors[key] = value[0]
            })

            return errors
        }},
        ...methodDescriptors
    })
}

function isSynthetic(payload) {
    return Array.isArray(payload)
        && payload.length === 2
        && typeof payload[1] === 'object'
        && Object.keys(payload[1]).includes('s')
}

async function callMethod(symbol, path, method, params) {
    let result = await requestMethodCall(symbol, path, method, params)

    return result
}

let requestTargetQueue = new Map

function requestMethodCall(symbol, path, method, params) {
    if (! requestTargetQueue.has(symbol)) {
        requestTargetQueue.set(symbol, { calls: [], receivers: [] })
    }

    triggerSend()

    return new Promise((resolve, reject) => {
        let queue = requestTargetQueue.get(symbol)

        queue.calls.push({
            path,
            method,
            params,
            handleReturn(value) {
                resolve(value)
            },
            handleError(value) {
                reject(value)
            },
        })
    })
}

let requestBufferTimeout

function triggerSend() {
    if (requestBufferTimeout) return

    requestBufferTimeout = setTimeout(() => {
        sendMethodCall()

        requestBufferTimeout = undefined
    }, 5)
}

async function sendMethodCall() {
    let payload = []
    let receivers = []

    requestTargetQueue.forEach((request, symbol) => {
        let target = store.get(symbol)

        let propertiesDiff = diff(target.canonical, target.ephemeral)

        payload.push({
            snapshot: target.snapshot,
            diff: propertiesDiff,
            calls: request.calls.map(i => ({
                path: i.path,
                method: i.method,
                params: i.params,
            }))
        })

        target.loading.state = true

        receivers.push((snapshot, effects) => {
            mergeNewSnapshot(symbol, snapshot, effects)

            for (let i = 0; i < effects.returns.length; i++) {
                request.calls[i].handleReturn(effects.returns[i])
            }

            if (effects['']['html']) {
                Alpine.morph(document.getElementById(effects['']['id']), effects['']['html'])
            }

            target.errors.state = effects.errors
            target.loading.state = false
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

function diff(left, right, diffs = {}, path = '') {
    // Are they the same.
    if (left === right) return diffs

    // Are they COMPLETELY different?
    if (typeof left !== typeof right || (isObject(left) && isArray(right)) || (isArray(left) && isObject(right))) {
        diffs[path] = right;
        return diffs
    }

    // Is the right or left side leafy?
    if (isLeafy(left) || isLeafy(right)) {
        diffs[path] = right
        return diffs
    }

    let leftKeys = Object.keys(left)

    Object.entries(right).forEach(([key, value]) => {
        diffs = {...diffs, ...diff(left[key], right[key], diffs, path === '' ? key : `${path}.${key}`)}
        leftKeys = leftKeys.filter(i => i !== key)
    })

    leftKeys.forEach(key => {
        diffs[`${path}.${key}`] = '__rm__'
    })

    return diffs
}

function isLeafy(subject) { return typeof subject !== 'object' || subject === null }
function deeplyEqual(a, b) { return JSON.stringify(a) === JSON.stringify(b) }
function isObjecty(subject) { return (typeof subject === 'object' && subject !== null) }
function isObject(subject) { return (isObjecty(subject) && ! isArray(subject)) }
function isArray(subject) { return Array.isArray(subject) }
function isFunction(subject) { return typeof subject === 'function' }
function deepClone(obj) { return JSON.parse(JSON.stringify(obj)) }

function mergeNewSnapshot(symbol, snapshot, effects) {
    let target = store.get(symbol)

    target.snapshot = snapshot
    target.effects = effects
    target.canonical = extractData(deepClone(snapshot.data), symbol)

    let newData = extractData(deepClone(snapshot.data), symbol)

    Object.entries(target.ephemeral).forEach(([key, value]) => {
        if (
            JSON.stringify(target.ephemeral[key]) !== JSON.stringify(newData[key])
        ) {
            target.reactive[key] = newData[key]
        }
    })
}

export function decorate(object, decorator) {
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

function dataGet(object, key) {
    if (key === '') return object

    return key.split('.').reduce((carry, i) => {
        if (carry === undefined) return undefined

        return carry[i]
    }, object)
}

// This code and concept is all Jonathan Reinink - thanks main!
function showHtmlModal(html) {
    let page = document.createElement('html')
    page.innerHTML = html
    page.querySelectorAll('a').forEach(a =>
        a.setAttribute('target', '_top')
    )

    let modal = document.getElementById('livewire-error')

    if (typeof modal != 'undefined' && modal != null) {
        // Modal already exists.
        modal.innerHTML = ''
    } else {
        modal = document.createElement('div')
        modal.id = 'livewire-error'
        modal.style.position = 'fixed'
        modal.style.width = '100vw'
        modal.style.height = '100vh'
        modal.style.padding = '50px'
        modal.style.backgroundColor = 'rgba(0, 0, 0, .6)'
        modal.style.zIndex = 200000
    }

    let iframe = document.createElement('iframe')
    iframe.style.backgroundColor = '#17161A'
    iframe.style.borderRadius = '5px'
    iframe.style.width = '100%'
    iframe.style.height = '100%'
    modal.appendChild(iframe)

    document.body.prepend(modal)
    document.body.style.overflow = 'hidden'
    iframe.contentWindow.document.open()
    iframe.contentWindow.document.write(page.outerHTML)
    iframe.contentWindow.document.close()

    // Close on click.
    modal.addEventListener('click', () => hideHtmlModal(modal))

    // Close on escape key press.
    modal.setAttribute('tabindex', 0)
    modal.addEventListener('keydown', e => {
        if (e.key === 'Escape') hideHtmlModal(modal)
    })
    modal.focus()
}

function hideHtmlModal(modal) {
    modal.outerHTML = ''
    document.body.style.overflow = 'visible'
}

