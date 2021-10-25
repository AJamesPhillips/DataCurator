import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { get_created_at_ms } from "../../shared/utils_datetime/utils_datetime"
import type { VAPsType } from "../../wcomponent/interfaces/VAPsType"
import type { ValuePossibilitiesById } from "../../wcomponent/interfaces/possibility"
import type {
    HasVAPSetsAndMaybeValuePossibilities,
    StateValueAndPredictionsSet,
} from "../../wcomponent/interfaces/state"
import {
    partition_and_prune_items_by_datetimes_and_versions,
} from "../../wcomponent_derived/value_and_prediction/partition_and_prune_items_by_datetimes_and_versions"
import { ACTIONS } from "../../state/actions"
import type { RootState } from "../../state/State"
import { selector_chosen_base_id } from "../../state/user_info/selector"
import { ValueAndPredictionSetsComponent } from "./ValueAndPredictionSetsComponent"
import { update_value_possibilities_with_VAPSets } from "../../wcomponent/CRUD_helpers/update_possibilities_with_VAPSets"
import { get_uncertain_datetime } from "../../shared/uncertainty/datetime"



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

    const { invalid_future_items, past_items, present_item, future_items, previous_versions_by_id } = partition_and_prune_items_by_datetimes_and_versions({
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
            const value_possibilities = update_value_possibilities_with_VAPSets(props.value_possibilities, new_values_and_prediction_sets)
            props.update_values_and_predictions({
                value_possibilities, values_and_prediction_sets: new_values_and_prediction_sets
            })

            const orig_latest_datetimes_ms = get_latest_VAP_set_datetimes_ms(orig_values_and_prediction_sets, current_created_at_ms)
            const new_latest_datetimes_ms = get_latest_VAP_set_datetimes_ms(new_values_and_prediction_sets, current_created_at_ms)
            if (new_latest_datetimes_ms.latest_created_at_ms > orig_latest_datetimes_ms.latest_created_at_ms)
            {
                const created_at_ms = new_latest_datetimes_ms.latest_created_at_ms + (1000 * 60)
                // Move to latest sim_ms so that when changing an action's status it updates appropriately
                const sim_ms = new_latest_datetimes_ms.latest_sim_ms
                change_route({ args: { created_at_ms, sim_ms } })
            }
        }}

        value_possibilities={props.value_possibilities}

        values_and_prediction_sets={orig_values_and_prediction_sets}
        invalid_future_items={invalid_future_items}
        past_items={past_items}
        present_item={present_item}
        future_items={future_items}
        previous_versions_by_id={previous_versions_by_id}

        base_id={base_id}
        creation_context={props.creation_context}
        editing={props.editing}
    />
}

export const ValueAndPredictionSets = connector(_ValueAndPredictionSets) as FunctionalComponent<OwnProps>



function get_latest_VAP_set_datetimes_ms (values_and_prediction_sets: StateValueAndPredictionsSet[], latest_created_at_ms = 0)
{
    let latest_sim_ms = Number.NEGATIVE_INFINITY

    values_and_prediction_sets.forEach(VAP_set =>
    {
        latest_created_at_ms = Math.max(get_created_at_ms(VAP_set), latest_created_at_ms)

        const sim_datetime = get_uncertain_datetime(VAP_set.datetime)
        if (sim_datetime) latest_sim_ms = Math.max(sim_datetime.getTime(), latest_sim_ms)
    })

    return { latest_created_at_ms, latest_sim_ms }
}
