declare module "simulation" {
    interface ModelConfig
    {
        primitiveFn?: (root, type) => SimulationNode[]
        timeStart?: number
        timeLength?: number
        timeUnits?: TimeUnitsAll // todo
    }

    interface ModelVariableConfig
    {
        name: string
        value: number | string | "True" | "False"
    }


    export class Model
    {
        constructor (config: ModelConfig)

        Variable (config: ModelVariableConfig): SimulationComponent { }

        simulate (): SimulationResult { }

        Link (source_component: SimulationComponent, consuming_component: SimulationComponent) { }
    }

    export interface SimulationError
    {
        code: number
        columnNumber: number
        lineNumber: number
        message: string
    }
}


type TimeUnits = "years"
type TimeUnitsAll = "Years" | TimeUnits


interface SimulationNode
{
    attributes: {}
    parent?: SimulationNode
    children: (SimulationNode | null)[]
    id: string
    value: {}
    _primitive: { model: {} }
    source: null
    target: null
}


interface SimulationComponent
{
    _node: SimulationNode
    model: {}
}

interface SimulationResult
{
    _data: SimulationResult_data
    _nameIdMapping: {[index: string]: string} // maps id to Variable.name
    timeUnits: TimeUnits
}

interface SimulationResult_data
{
    times: number[]
    data: {[id: string]: number}[]
    timeUnits: TimeUnits
    children: {[id: string]: {data: {}, results: number[], dataMode: "float"}}
    error: null
    errorPrimitive: null
    stochastic: boolean
    periods: number
}
