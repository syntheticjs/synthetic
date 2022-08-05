import { dataGet, each } from "../utils"
import { on } from "../events"

export default function () {
    on('effects', (target, effects, path) => {
        let decorator = dataGet(target.ephemeral, path).__decorator
        let methods = effects['js'] || []

        each(methods, (name, expression) => {
            let func = new Function([], 'return '+expression)
            let boundFunc = func.bind(dataGet(target.reactive, path))
            let run = boundFunc()

            Object.defineProperty(decorator, name, { value: run })
        })
    })
}
