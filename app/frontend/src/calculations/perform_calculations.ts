import { Model } from "simulation"
import { get_ids_from_text } from "../sharedf/rich_text/replace_normal_ids"
import { WComponentsById } from "../wcomponent/interfaces/SpecialisedObjects"
import { CalculationResult, PlainCalculationObject } from "./interfaces"
// note: will probably rename this file once it becomes clear what function is
// required.

export function perform_calculations (calculations: PlainCalculationObject[], wcomponents_by_id: WComponentsById)
{
    const calculation_results: CalculationResult[] = calculations.map(calculation_string =>
    {
        const model = new Model({
            timeStart: 2020,
            timeLength: 1,
            timeUnits: "Years"
        })
        const converted_calculation = convert_equation(calculation_string.value)

        const model_component = model.Variable({
            name: "Some component name",
            value: converted_calculation,
        })

        const calculation_result = model.simulate()
        const value = calculation_result!._data.data[0]![model_component!._node.id]

        return { value }
    })

    return calculation_results
}



function convert_equation (equation: string): string
{
    let converted_equation = equation

    const ids = get_ids_from_text(equation)
    ids.forEach(id =>
    {
        const replacer = new RegExp(`@@${id}`, "g")

        const replacement_content = `[${id}]`

        converted_equation = converted_equation.replace(replacer, replacement_content)
    })

    return converted_equation
}
