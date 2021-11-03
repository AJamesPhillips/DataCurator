import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { VAPsType } from "../../wcomponent/interfaces/VAPsType"
import type { ValuePossibilitiesById } from "../../wcomponent/interfaces/possibility"
import type {
    HasVAPSetsAndMaybeValuePossibilities,
    StateValueAndPredictionsSet,
} from "../../wcomponent/interfaces/state"
import { ACTIONS } from "../../state/actions"
import type { RootState } from "../../state/State"
import { selector_chosen_base_id } from "../../state/user_info/selector"
import { Button } from "../../sharedf/Button"
import { group_versions_by_id } from "../../wcomponent_derived/value_and_prediction/group_versions_by_id"
import { sort_by_uncertain_event_datetimes } from "../../shared/utils_datetime/partition_by_uncertain_datetime"
import { VALUE_POSSIBILITY_IDS } from "../../wcomponent/value/parse_value"
import { prepare_new_VAP_set } from "../../wcomponent/CRUD_helpers/prepare_new_VAP_set"
import { handle_update_VAP_sets } from "./handle_update_VAP_sets"
import { update_VAP_set_VAP_probabilities } from "./update_VAP_set_VAP_probabilities"



interface OwnProps
{
    VAPs_represent: VAPsType
    existing_value_possibilities: ValuePossibilitiesById | undefined
    values_and_prediction_sets: StateValueAndPredictionsSet[]
    update_VAPSets_and_value_possibilities: (args: HasVAPSetsAndMaybeValuePossibilities) => void
}


const map_state = (state: RootState) =>
{
    return {
        created_at_ms: state.routing.args.created_at_ms,
        sim_ms: state.routing.args.sim_ms,
        creation_context: state.creation_context,
        editing: !state.display_options.consumption_formatting,
        base_id: selector_chosen_base_id(state) || -1,
        current_created_at_ms: state.routing.args.created_at_ms,
    }
}


const map_dispatch = {
    change_route: ACTIONS.routing.change_route,
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps


function _EasyActionValueAndPredictionSets (props: Props)
{
    const {
        existing_value_possibilities, values_and_prediction_sets: orig_values_and_prediction_sets,
        VAPs_represent, base_id,
        editing,
        current_created_at_ms, sim_ms, creation_context,
        update_VAPSets_and_value_possibilities, change_route,
    } = props

    if (!editing || VAPs_represent !== VAPsType.action) return null

    const { latest } = group_versions_by_id(orig_values_and_prediction_sets)

    const sorted_items = sort_by_uncertain_event_datetimes(latest)
    const last_VAP_set = sorted_items[0]
    const last_value_id = last_VAP_set?.entries.find(e => e.probability === 1)?.value_id

    const last_is_potential = last_value_id === VALUE_POSSIBILITY_IDS.action_potential
    const last_is_paused = last_value_id === VALUE_POSSIBILITY_IDS.action_paused
    const last_is_in_progress = last_value_id === VALUE_POSSIBILITY_IDS.action_in_progress

    const allow_in_progress = !last_VAP_set || last_is_potential || last_is_paused
    const allow_pause = last_is_in_progress
    const allow_completed = !last_VAP_set || last_is_in_progress


    function mark_as (action_value_possibility_id: string)
    {
        const new_VAP_set = prepare_new_VAP_set(VAPs_represent, existing_value_possibilities, orig_values_and_prediction_sets, base_id, creation_context)

        const entries = update_VAP_set_VAP_probabilities(new_VAP_set, action_value_possibility_id)
        new_VAP_set.entries = entries

        const new_values_and_prediction_sets = [...orig_values_and_prediction_sets, new_VAP_set]

        handle_update_VAP_sets({
            existing_value_possibilities,
            new_values_and_prediction_sets,
            orig_values_and_prediction_sets,
            current_created_at_ms,
            sim_ms,
            update_VAPSets_and_value_possibilities,
            change_route,
        })
    }


    return <div>
        {allow_in_progress && <Button
            value="In Progress"
            fullWidth={true}
            color="secondary"
            onClick={() => mark_as(VALUE_POSSIBILITY_IDS.action_in_progress)}
        />}
        {allow_pause && <Button
            value="Pause"
            fullWidth={true}
            color="secondary"
            onClick={() => mark_as(VALUE_POSSIBILITY_IDS.action_paused)}
        />}
        {allow_completed && <Button
            value="Completed"
            fullWidth={true}
            color="secondary"
            onClick={() => mark_as(VALUE_POSSIBILITY_IDS.action_completed)}
        />}
    </div>
}

export const EasyActionValueAndPredictionSets = connector(_EasyActionValueAndPredictionSets) as FunctionalComponent<OwnProps>
