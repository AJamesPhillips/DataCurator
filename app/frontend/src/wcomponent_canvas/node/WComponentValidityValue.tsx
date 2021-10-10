import { h, FunctionalComponent } from "preact"
import { connect, ConnectedProps } from "react-redux"

import type {
    WComponent,
} from "../../wcomponent/interfaces/SpecialisedObjects"
import type { RootState } from "../../state/State"
import { DisplayValue } from "../../wcomponent_derived/shared_components/DisplayValue"
import { get_wcomponent_validity_UI_value } from "../../wcomponent_derived/get_wcomponent_validity_UI_value"



interface OwnProps
{
    wcomponent: WComponent
}


const map_state = (state: RootState) =>
{
    const { created_at_ms, sim_ms } = state.routing.args

    return { created_at_ms, sim_ms }
}


const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps


function _WComponentValidityValue (props: Props)
{
    const ui_value = get_wcomponent_validity_UI_value(props)

    return <div className="node_validity_value_container">
        <DisplayValue UI_value={ui_value} />
    </div>
}

export const WComponentValidityValue = connector(_WComponentValidityValue) as FunctionalComponent<OwnProps>
