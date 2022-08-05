import { reactive } from "../index"
import { on } from "../events"

export default function () {
    on('new', target => {
        target.__loading = reactive({ state: false })
    })

    on('request', (target, payload) => {
        target.__loading.state = true

        return () => target.__loading.state = false
    })

    on('decorate', (target, path) => {
        return decorator => {
            Object.defineProperty(decorator, '$loading', { get() {
                return target.__loading.state
            }})

            return decorator
        }
    })
}
