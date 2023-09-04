import { Model } from "simulation"
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

    const component = model.Variable({
        name: "<Component name>",
        value: "12.3 * 10",
    })

    const results = model.simulate()

    const calculation_result = results

    console.log("calculation result", calculation_result)
}
