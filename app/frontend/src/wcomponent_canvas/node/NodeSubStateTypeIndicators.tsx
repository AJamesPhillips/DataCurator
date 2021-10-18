import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { wcomponent_should_have_state_VAP_sets } from "../../wcomponent/interfaces/SpecialisedObjects"
import type { WComponentSubState } from "../../wcomponent/interfaces/substate"
import type { RootState } from "../../state/State"
import { LockClockIcon } from "../../sharedf/icons/LockClockIcon"
import { ReducedPossibilitiesIcon } from "../../sharedf/icons/ReducedPossibilitiesIcon"
import { convert_VAP_sets_to_visual_sub_state_value_possibilities } from "../../wcomponent_derived/sub_state/convert_VAP_sets_to_visual_sub_state_value_possibilities"



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
        presenting: state.display_options.consumption_formatting,
    }
}

const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps


enum SubStateTypeStatus {
    not_set,
    set,
    invalid
}


function _NodeSubStateTypeIndicators (props: Props)
{
    const { target_wcomponent, presenting } = props
    if (!target_wcomponent || presenting) return null

    const { selector } = props.wcomponent
    const { target_VAP_set_id, target_value_id_type, target_value } = selector || {}
    const target_VAP_sets = target_wcomponent.values_and_prediction_sets || []

    const time_substate: SubStateTypeStatus = target_VAP_set_id === undefined
        ? SubStateTypeStatus.not_set
        : target_VAP_sets.find(({ id }) => id === target_VAP_set_id) ? SubStateTypeStatus.set
        : SubStateTypeStatus.invalid

    const simple_possibilities = convert_VAP_sets_to_visual_sub_state_value_possibilities({ selector, target_wcomponent })
    const possibility_substate: SubStateTypeStatus = (target_value_id_type === undefined || target_value === undefined)
        ? SubStateTypeStatus.not_set
        : simple_possibilities.find(({ selected }) => selected) ? SubStateTypeStatus.set
        : SubStateTypeStatus.invalid

    const time_substate_color = sub_state_type_status_to_color(time_substate)
    const possibility_substate_color = sub_state_type_status_to_color(possibility_substate)

    return <div className="sub_state_type_indicators">
        <LockClockIcon
            className={time_substate_color}
            title={"Specific Time" + sub_state_type_status_to_title(time_substate)}
        />
        <ReducedPossibilitiesIcon
            className={possibility_substate_color}
            title={"Specific Possibility" + sub_state_type_status_to_title(possibility_substate)}
        />
    </div>
}

export const NodeSubStateTypeIndicators = connector(_NodeSubStateTypeIndicators) as FunctionalComponent<OwnProps>



function sub_state_type_status_to_color (status: SubStateTypeStatus)
{
    if (status === SubStateTypeStatus.set) return " sub_state_type_status__set "
    if (status === SubStateTypeStatus.not_set) return " sub_state_type_status__not_set "
    return " sub_state_type_status__invalid "
}

function sub_state_type_status_to_title (status: SubStateTypeStatus)
{
    if (status === SubStateTypeStatus.set) return "Set"
    if (status === SubStateTypeStatus.not_set) return "Not set"
    return "Invalid"
}
