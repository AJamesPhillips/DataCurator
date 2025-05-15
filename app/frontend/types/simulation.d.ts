declare module "simulation" {
    interface ModelConfig
    {
        primitiveFn?: (root, type) => SimulationNode[]
        timeStart?: number
        timeStep?: number
        timeLength?: number
        timeUnits?: TimeUnitsAll // todo
        timePause?: number
        algorithm?: "Euler" | "RK4"
    }

    interface ModelVariableConfig
    {
        name: string
        value: number | string // | "True" | "False"
        units?: string
        note?: string
    }

    interface ModelStockConfig
    {
        name: string
        initial?: number | string // | "True" | "False"
        units?: string
        note?: string
    }

    interface ModelActionConfig
    {
        name: string
        action: string
        trigger: "Timeout" | "Probability" | "Condition"
        value: string // number | string | "True" | "False"
        note?: string
    }


    interface Primitive
    {
        id: string
    }


    interface OnPauseSimulationArg
    {
        results: SimulationResult
        time: number
        setValue: (primitive: Primitive | SimulationComponent, value: number) => void
    }


    export class Model
    {
        constructor (config: ModelConfig)

        Variable(config: ModelVariableConfig): SimulationComponent
        Stock(config: ModelStockConfig): SimulationComponent
        Flow(from_component: SimulationComponent | undefined, to_component: SimulationComponent | undefined, config: { name: string; note?: string, rate: string | number, nonNegative?: boolean }): SimulationComponent {}
        Action(config: ModelActionConfig): SimulationComponent

        simulate(): SimulationResult
        simulateAsync(config: { onPause: (simulation: OnPauseSimulationArg) => void }): Promise<SimulationResult>

        Link(source_component: SimulationComponent, consuming_component: SimulationComponent)

        findStocks(selector: (model_item: {_node: SimulationNode, model: {_graph: object, settings: object, p: () => object } }) => void): SimulationComponent[]
        getId(model_id: string): SimulationComponent | null

        set customUnits(custom_units: CustomUnit[]): void
    }

    export interface SimulationError
    {
        code: number
        columnNumber: number
        lineNumber: number
        message: string
    }


    type TimeUnits = "years"
    type TimeUnitsAll = "Years" | "Seconds" | TimeUnits


    type ModelAttributeNames = "name" | "Note" | "Equation" | "Units" | "MaxConstraintUsed" | "MinConstraintUsed" | "MaxConstraint" | "MinConstraint" | "ShowSlider" | "SliderMax" | "SliderMin" | "SliderStep" | "Image" | "FlipHorizontal" | "FlipVertical" | "LabelPosition"

    interface SimulationNode
    {
        attributes: Map
        parent?: SimulationNode
        children: (SimulationNode | null)[]
        id: string
        value: object
        _primitive: { model: object }
        source: null
        target: null
        getAttribute(attribute_name: "Units"): string
        getAttribute(attribute_name: ModelAttributeNames): unknown
    }

    interface SimulationComponent
    {
        _node: SimulationNode
        model: object
        units?: string
    }

    interface SimulationResult
    {
        _data: SimulationResult_data
        _nameIdMapping: {[index: string]: string} // maps id to Variable.name
        timeUnits: TimeUnits
        value: (primitive: Primitive | SimulationComponent, time: number) => object
    }

    interface SimulationResult_data
    {
        times: number[]
        data: {[id: string]: number}[]
        timeUnits: TimeUnits
        children: {[id: string]: {data: object, results: number[], dataMode: "float"}}
        error: null
        errorPrimitive: null
        stochastic: boolean
        value(primitive: Primitive): object
        lastValue(): object
        periods: number
        resume(): void
        setValue(primitive: Primitive, value: number): void
    }

    interface CustomUnit
    {
        name: string
        scale: number
        target: string
    }
}
