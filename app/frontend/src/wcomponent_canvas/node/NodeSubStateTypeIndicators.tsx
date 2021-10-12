import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { wcomponent_should_have_state_VAP_sets } from "../../wcomponent/interfaces/SpecialisedObjects"
import type { WComponentSubState } from "../../wcomponent/interfaces/substate"
import type { RootState } from "../../state/State"
import { LockClockIcon } from "../../sharedf/icons/LockClockIcon"
import { ReducedPossibilitiesIcon } from "../../sharedf/icons/ReducedPossibilitiesIcon"



interface OwnProps
{
    wcomponent: WComponentSubState
}


const map_state = (state: RootState, own_props: OwnProps) =>
{
    const { target_wcomponent_id } = own_props.wcomponent
    const maybe_target_wcomponent = state.specialised_objects.wcomponents_by_id[target_wcomponent_id || ""]
    const target_wcomponent = wcomponent_should_have_state_VAP_sets(maybe_target_wcomponent) && maybe_target_wcomponent

    return {
        target_wcomponent,
    }
}

const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps


function _NodeSubStateTypeIndicators (props: Props)
{
    const { target_wcomponent } = props
    if (!target_wcomponent) return null

    const { selector } = props.wcomponent
    const { target_VAP_set_id, target_value_id_type, target_value } = selector || {}

    const time_substate = target_VAP_set_id !== undefined
    const possibility_substate = target_value_id_type !== undefined && target_value !== undefined

    const time_substate_color = time_substate ? "rgba(50,50,50,0.8)" : "rgba(200,200,200,0.4)"
    const possibility_substate_color = possibility_substate ? "rgba(50,50,50,0.8)" : "rgba(200,200,200,0.4)"

    return <div>
        <LockClockIcon
            style={{ color: time_substate_color }}
            title={time_substate ? `Set to ${""}` : "Not set"}
        />
        <ReducedPossibilitiesIcon
            style={{ color: possibility_substate_color }}
            title={possibility_substate ? `Set to ${""}` : "Not set"}
        />
    </div>
}

export const NodeSubStateTypeIndicators = connector(_NodeSubStateTypeIndicators) as FunctionalComponent<OwnProps>
