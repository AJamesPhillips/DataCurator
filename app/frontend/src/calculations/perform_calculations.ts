import { Model, SimulationError } from "simulation"
import { WComponentsById } from "../wcomponent/interfaces/SpecialisedObjects"
import { CalculationResult, PlainCalculationObject } from "./interfaces"
import { normalise_calculation_ids_and_extract_uuids } from "./normalise_calculation_ids"
import { get_wcomponent_state_value_and_probabilities } from "../wcomponent_derived/get_wcomponent_state_value"



export function perform_calculations (calculations: PlainCalculationObject[], wcomponents_by_id: WComponentsById)
{
    const values: { [id: string]: number | undefined } = {}

    const calculation_results: CalculationResult[] = calculations.map(calculation =>
    {
        const model = new Model({
            timeStart: 2020,
            timeLength: 1,
            timeUnits: "Years"
        })

        const { uuids, converted_calculation } = normalise_calculation_ids_and_extract_uuids(calculation.value)
        const model_component = model.Variable({
            name: calculation.name,
            value: converted_calculation,
        })

        prepare_other_components(model, model_component, values, uuids, wcomponents_by_id)

        const { value, error } = run_model(model, model_component)

        // Store calculation value for use in future calculations
        values[calculation.name] = value

        const calculation_result: CalculationResult = { value }
        if (error) calculation_result.error = error

        return calculation_result
    })

    return calculation_results
}



function prepare_other_components (model: Model, model_component: SimulationComponent, values: { [id: string]: number | undefined }, uuids: string[], wcomponents_by_id: WComponentsById)
{
    const other_components: { [id: string]: SimulationComponent } = {}

    Object.entries(values).forEach(([name, value]) =>
    {
        if (value !== undefined) {
            const component = model.Variable({ name, value })
            other_components[name] = component
        }
    })

    const now_ms = new Date().getTime()

    uuids.forEach(uuid =>
    {
        const wcomponent = wcomponents_by_id[uuid]
        if (!wcomponent) return

        const VAP_sets = get_wcomponent_state_value_and_probabilities({
            wcomponent,
            VAP_set_id_to_counterfactual_v2_map: {},
            created_at_ms: now_ms,
            sim_ms: now_ms,
        }).most_probable_VAP_set_values
        if (VAP_sets.length === 0) return

        const value = VAP_sets[0]!.parsed_value

        if (value === undefined || value === null) return

        // Note that currently the value of boolean's is a string of "True" or "False"
        if (typeof value === "boolean") return

        const component = model.Variable({ name: uuid, value })
        other_components[uuid] = component
    })

    Object.values(other_components).forEach((other_component) =>
    {
        model.Link(other_component, model_component)
    })
}



function run_model (model: Model, model_component: SimulationComponent)
{
    let value: number | undefined = undefined
    let error = ""

    try {
        const calculation_result = model.simulate()
        value = calculation_result!._data.data[0]![model_component!._node.id]
    }
    catch (e) {
        const err = e as SimulationError
        error = `${err.message}`
        // Defensive approach to ensure there's always an error in case
        // err.message is ever an empty string
        error = error || "Unknown calculation error"
    }

    return { value, error }
}
