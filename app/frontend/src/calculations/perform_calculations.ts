import { Model, SimulationError } from "simulation"
import { WComponentsById } from "../wcomponent/interfaces/SpecialisedObjects"
import { CalculationResult, PlainCalculationObject } from "./interfaces"
import { convert_equation } from "./convert_equation"



export function perform_calculations (calculations: PlainCalculationObject[], wcomponents_by_id: WComponentsById)
{
    const values: {[id: string]: number | undefined} = {}

    const calculation_results: CalculationResult[] = calculations.map(calculation =>
    {
        const model = new Model({
            timeStart: 2020,
            timeLength: 1,
            timeUnits: "Years"
        })

        const other_components: {[id: string]: SimulationComponent} = {}
        Object.entries(values).forEach(([name, value]) =>
        {
            if (value !== undefined)
            {
                const component = model.Variable({ name, value })
                other_components[name] = component
            }
        })

        const converted_calculation = convert_equation(calculation.value)
        const model_component = model.Variable({
            name: calculation.name,
            value: converted_calculation,
        })

        Object.values(other_components).forEach((other_component) =>
        {
            model.Link(other_component, model_component)
        })


        let value: number | undefined = undefined
        let error = ""
        try
        {
            const calculation_result = model.simulate()
            value = calculation_result!._data.data[0]![model_component!._node.id]
        }
        catch (e)
        {
            const err = e as SimulationError
            error = `${err.message}`
        }

        // Store calculation value for use in future calculations
        values[calculation.name] = value

        const calculation_result: CalculationResult = { value }
        if (error) calculation_result.error = error

        return calculation_result
    })

    return calculation_results
}
