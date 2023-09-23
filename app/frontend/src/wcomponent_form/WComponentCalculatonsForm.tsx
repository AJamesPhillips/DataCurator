import { FunctionalComponent } from "preact"
import { connect, ConnectedProps } from "react-redux"

import type { WComponentNodeStateV2 } from "../wcomponent/interfaces/state"
import type { RootState } from "../state/State"
import { perform_calculations } from "../calculations/perform_calculations"
import { CalculationResult, PlainCalculationObject } from "../calculations/interfaces"
import { WarningTriangle } from "../sharedf/WarningTriangle"



interface OwnProps
{
    wcomponent: WComponentNodeStateV2
}


const map_state = (state: RootState) =>
{
    const wcomponents_by_id = state.specialised_objects.wcomponents_by_id

    return {
        wcomponents_by_id,
    }
}


const map_dispatch = {
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps


function _WComponentCalculatonsForm (props: Props)
{
    const {
        wcomponent,
        wcomponents_by_id,
    } = props

    let { calculations = [] } = wcomponent
    calculations = [
        {name: "A", value: "50"},
        {name: "B", value: "10"},
        {name: "C", value: "A + B"},
    ]

    const calculation_results = perform_calculations(calculations, wcomponents_by_id)

    return <div>
        {calculations.map((calc, index) => <CalculationRow
            calculation={calc}
            index={index}
            calculation_results={calculation_results}
        />)}
    </div>
}

export const WComponentCalculatonsForm = connector(_WComponentCalculatonsForm) as FunctionalComponent<OwnProps>



interface CalculationRowProps
{
    calculation: PlainCalculationObject
    index: number
    calculation_results: CalculationResult[]
}

function CalculationRow (props: CalculationRowProps)
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


function values_different (value1: string, value2: number)
{
    return value1 !== value2.toString()
}
