import { WarningTriangle } from "../../sharedf/WarningTriangle"
import { CalculationRowProps } from "./EditableCalculationRow"
import { values_different } from "./values_different"



export function CalculationRow (props: CalculationRowProps)
{
    const { calculation: calc, index, calculation_results: results } = props

    const result = results[index]

    let result_string = ""
    if (result?.value && values_different(calc.value, result.value))
    {
        result_string = `= ${result?.value}`
    }

    return <div key={calc.name + " " + index}>
        {calc.name} = {calc.value} {result_string}
        {result && result.error && <WarningTriangle message={result.error} />}
    </div>
}
