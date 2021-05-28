import { h, FunctionalComponent } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { get_wcomponent_validity_value } from "../shared/wcomponent/get_wcomponent_validity_value"
import type { UIValue } from "../shared/wcomponent/interfaces/generic_value"
import type {
    WComponent,
} from "../shared/wcomponent/interfaces/SpecialisedObjects"
import type { RootState } from "../state/State"
import { DisplayValue } from "./multiple_values/DisplayValue"



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
    const ui_value = get_wcomponent_validity_value_from_props(props)

    return <div className="node_validity_value_container">
        <DisplayValue UI_value={ui_value} />
    </div>
}

export const WComponentValidityValue = connector(_WComponentValidityValue) as FunctionalComponent<OwnProps>



function get_wcomponent_validity_value_from_props (props: Props): UIValue
{
    const { wcomponent, created_at_ms, sim_ms } = props

    const { value, uncertain, probability, conviction } = get_wcomponent_validity_value({ wcomponent, created_at_ms, sim_ms })

    const value_str = value === undefined ? undefined : (
        typeof value === "boolean" ? (value ? "Valid" : "Invalid") : undefined)

    return { value: value_str, probability, conviction, uncertain }
}
