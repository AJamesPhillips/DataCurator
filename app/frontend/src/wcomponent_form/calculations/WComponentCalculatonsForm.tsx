import { FunctionalComponent } from "preact"
import { connect, ConnectedProps } from "react-redux"

import type { WComponentNodeStateV2 } from "../../wcomponent/interfaces/state"
import type { RootState } from "../../state/State"
import { perform_calculations } from "../../calculations/perform_calculations"
import { EditableCalculationRow } from "./EditableCalculationRow"
import { CalculationRow } from "./CalculationRow"



interface OwnProps
{
    wcomponent: WComponentNodeStateV2
}


const map_state = (state: RootState) =>
{
    return {
        editing: !state.display_options.consumption_formatting,
        wcomponents_by_id: state.specialised_objects.wcomponents_by_id,
    }
}


const map_dispatch = {
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps


function _WComponentCalculatonsForm (props: Props)
{
    const {
        editing,
        wcomponent,
        wcomponents_by_id,
    } = props

    let { calculations = [] } = wcomponent
    calculations = [
        {name: "A", value: "10"}
    ]

    const calculation_results = perform_calculations(calculations, wcomponents_by_id)

    if (!editing)
    {
        return <div>
            {calculations.map((calc, index) => <CalculationRow
                calculation={calc}
                index={index}
                calculation_results={calculation_results}
            />)}
        </div>
    }

    return <div>
        {calculations.map((calc, index) => <EditableCalculationRow
            calculation={calc}
            index={index}
            calculation_results={calculation_results}
        />)}
    </div>
}

export const WComponentCalculatonsForm = connector(_WComponentCalculatonsForm) as FunctionalComponent<OwnProps>
