import { each } from "../utils"
import { on } from "../events"

export default function () {
    on('decorate', (target, path) => {
        return decorator => {
            Object.defineProperty(decorator, '$poll', { value: () => {
                syncronizedInterval(2500, () => {
                    target.ephemeral.$commit()
                })
            }})

            return decorator
        }
    })
}

let clocks = []

function syncronizedInterval(ms, callback) {
    if (! clocks[ms]) {
        let clock = {
            timer: setInterval(() => each(clock.callbacks, (key, value) => value()), ms),
            callbacks: [],
        }

        clocks[ms] = clock
    }

    clocks[ms].callbacks.push(callback)
}
