declare module "simulation" {
    type SimNode = any; // todo

    interface ModelConfig
    {
        primitiveFn?: (root, type) => SimNode[]
        timeStart?: number
        timeLength?: number
        timeUnits?: "Years" // todo
    }

    interface ModelVariableConfig
    {
        name: string
        value: number | string
    }

    // Types inside here
    export class Model
    {
        constructor (config: ModelConfig)

        Variable (config: ModelVariableConfig) { }

        simulate () { }
    }
}
