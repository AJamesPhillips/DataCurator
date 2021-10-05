import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import type { VAPsType } from "../../shared/wcomponent/interfaces/generic_value"
import type { ValuePossibilitiesById } from "../../shared/wcomponent/interfaces/possibility"
import type {
    HasVAPSetsAndMaybeValuePossibilities,
    StateValueAndPredictionsSet,
} from "../../shared/wcomponent/interfaces/state"
import { partition_and_prune_items_by_datetimes_and_versions } from "../../shared/wcomponent/value_and_prediction/utils"
import type { RootState } from "../../state/State"
import { selector_chosen_base_id } from "../../state/user_info/selector"
import { ValueAndPredictionSetsComponent } from "./ValueAndPredictionSetsComponent"
import { get_max_value_possibilities_order } from "./value_possibilities/get_max_value_possibilities_order"



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
    }
}



const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps


function _ValueAndPredictionSets (props: Props)
{
    const {
        wcomponent_id, values_and_prediction_sets, VAPs_represent, base_id = -1,
    } = props

    const { invalid_future_items, past_items, present_items, future_items, previous_versions_by_id } = partition_and_prune_items_by_datetimes_and_versions({
        items: values_and_prediction_sets,
        created_at_ms: props.created_at_ms,
        sim_ms: props.sim_ms,
    })

    return <ValueAndPredictionSetsComponent
        wcomponent_id={wcomponent_id}

        item_descriptor="Value Prediction"
        VAPs_represent={VAPs_represent}
        update_values_and_predictions={values_and_prediction_sets =>
        {
            const value_possibilities = update_value_possibilities(props.value_possibilities, values_and_prediction_sets)
            props.update_values_and_predictions({ value_possibilities, values_and_prediction_sets })
        }}

        value_possibilities={props.value_possibilities}

        values_and_prediction_sets={values_and_prediction_sets}
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



function update_value_possibilities (value_possibilities: ValuePossibilitiesById | undefined, values_and_prediction_sets: StateValueAndPredictionsSet[])
{
    let max_order = get_max_value_possibilities_order(value_possibilities)
    if (value_possibilities) value_possibilities = { ...value_possibilities }


    values_and_prediction_sets.forEach(VAP_set => {
        VAP_set.entries.forEach(VAP => {
            if (!VAP.value_id) return
            value_possibilities = value_possibilities || {}

            const order = value_possibilities[VAP.value_id]?.order ?? ++max_order

            value_possibilities[VAP.value_id] = {
                id: VAP.value_id,
                value: VAP.value,
                description: VAP.description,
                order,
            }
        })
    })

    return value_possibilities
}
