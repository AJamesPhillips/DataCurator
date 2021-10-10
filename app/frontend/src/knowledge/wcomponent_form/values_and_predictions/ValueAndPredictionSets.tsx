import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { get_created_at_ms } from "../../../shared/utils_datetime/utils_datetime"
import type { VAPsType } from "../../../wcomponent/interfaces/value_probabilities_etc"
import type { ValuePossibilitiesById } from "../../../wcomponent/interfaces/possibility"
import type {
    HasVAPSetsAndMaybeValuePossibilities,
    StateValueAndPredictionsSet,
} from "../../../wcomponent/interfaces/state"
import {
    partition_and_prune_items_by_datetimes_and_versions,
} from "../../../wcomponent/value_and_prediction/utils"
import { ACTIONS } from "../../../state/actions"
import type { RootState } from "../../../state/State"
import { selector_chosen_base_id } from "../../../state/user_info/selector"
import { ValueAndPredictionSetsComponent } from "./ValueAndPredictionSetsComponent"
import { update_value_possibilities } from "../../multiple_values/value_possibilities/update_possibilities_with_VAPs"



interface OwnProps
{
    wcomponent_id: string
    VAPs_represent: VAPsType
    value_possibilities: ValuePossibilitiesById | undefined
    values_and_prediction_sets: StateValueAndPredictionsSet[]
    update_values_and_predictions: (args: HasVAPSetsAndMaybeValuePossibilities) => void
}


const map_state = (state: RootState) =>
{
    return {
        created_at_ms: state.routing.args.created_at_ms,
        sim_ms: state.routing.args.sim_ms,
        creation_context: state.creation_context,
        editing: !state.display_options.consumption_formatting,
        base_id: selector_chosen_base_id(state),
        current_created_at_ms: state.routing.args.created_at_ms,
    }
}


const map_dispatch = {
    change_route: ACTIONS.routing.change_route,
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps


function _ValueAndPredictionSets (props: Props)
{
    const {
        wcomponent_id, values_and_prediction_sets: orig_values_and_prediction_sets, VAPs_represent, base_id = -1,
        current_created_at_ms, change_route,
    } = props

    const { invalid_future_items, past_items, present_items, future_items, previous_versions_by_id } = partition_and_prune_items_by_datetimes_and_versions({
        items: orig_values_and_prediction_sets,
        created_at_ms: props.created_at_ms,
        sim_ms: props.sim_ms,
    })

    return <ValueAndPredictionSetsComponent
        wcomponent_id={wcomponent_id}

        item_descriptor="Value Prediction"
        VAPs_represent={VAPs_represent}
        update_values_and_predictions={new_values_and_prediction_sets =>
        {
            const value_possibilities = update_value_possibilities(props.value_possibilities, new_values_and_prediction_sets)
            props.update_values_and_predictions({
                value_possibilities, values_and_prediction_sets: new_values_and_prediction_sets
            })

            const orig_latest_created_at_ms = get_latest_created_at_VAP_set_ms(orig_values_and_prediction_sets, current_created_at_ms)
            const new_latest_created_at_ms = get_latest_created_at_VAP_set_ms(new_values_and_prediction_sets, current_created_at_ms)
            if (new_latest_created_at_ms > orig_latest_created_at_ms)
            {
                change_route({ args: { created_at_ms: new_latest_created_at_ms + (1000 * 60) } })
            }
        }}

        value_possibilities={props.value_possibilities}

        values_and_prediction_sets={orig_values_and_prediction_sets}
        invalid_future_items={invalid_future_items}
        past_items={past_items}
        present_items={present_items}
        future_items={future_items}
        previous_versions_by_id={previous_versions_by_id}

        base_id={base_id}
        creation_context={props.creation_context}
        editing={props.editing}
    />
}

export const ValueAndPredictionSets = connector(_ValueAndPredictionSets) as FunctionalComponent<OwnProps>



function get_latest_created_at_VAP_set_ms (values_and_prediction_sets: StateValueAndPredictionsSet[], latest_ms = 0)
{

    values_and_prediction_sets.forEach(VAP_set =>
    {
        latest_ms = Math.max(get_created_at_ms(VAP_set), latest_ms)
    })

    return latest_ms
}
