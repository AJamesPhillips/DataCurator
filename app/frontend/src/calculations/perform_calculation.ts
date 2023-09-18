import { Model } from "simulation"
import { uuid_v4_for_tests } from "../utils/uuid_v4_for_tests"
import { get_ids_from_text } from "../sharedf/rich_text/replace_normal_ids"
// note: will probably rename this file once it becomes clear what function is
// required.

export function perform_calculation ()
{
    const calculation = "12.3 * 10"

    const model = new Model({
        timeStart: 2020,
        timeLength: 1,
        timeUnits: "Years"
    })

    const id1 = uuid_v4_for_tests(1)

    const component = model.Variable({
        name: id1,
        value: 12.3,
    })

    const equation2 = `@@${id1} * 10`
    const converted_equation2 = convert_equation(equation2)

    const component2 = model.Variable({
        name: "Some component name",
        value: converted_equation2,
    })

    model.Link(component, component2)

    const calculation_result = model.simulate()


    console.log("Result = ", calculation_result._data.data[0]![component2._node.id])
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
