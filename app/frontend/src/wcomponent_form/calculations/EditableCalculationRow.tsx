import { CalculationResult, PlainCalculationObject } from "../../calculations/interfaces"
import { WarningTriangle } from "../../sharedf/WarningTriangle"
import { values_different } from "./values_different"



export interface CalculationRowProps
{
    calculation: PlainCalculationObject
    index: number
    calculation_results: CalculationResult[]
}

export function EditableCalculationRow (props: CalculationRowProps)
{
    const { calculation: calc, index, calculation_results: results } = props

    const result = results[index]

    let result_string = ""
    if (result?.value && values_different(calc.value, result.value))
    {
        result_string = `= ${result?.value}`
    }

    return <div key={calc.name + " " + index}>
        {/* <WarningTriangleV2 warning="ABC" label="DEF" /> */}
        {/* <WarningTriangle message={"result.error"} /> */}
        <br />
        {calc.name} = {calc.value} {result_string}
        {result && result.error && <WarningTriangle message={result.error} />}
    </div>
}
