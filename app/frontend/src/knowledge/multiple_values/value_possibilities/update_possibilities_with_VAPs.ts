import type { ValuePossibilitiesById } from "../../../wcomponent/interfaces/possibility"
import type { StateValueAndPredictionsSet } from "../../../wcomponent/interfaces/state"
import { get_max_value_possibilities_order } from "./get_max_value_possibilities_order"



export function update_value_possibilities (value_possibilities: ValuePossibilitiesById | undefined, values_and_prediction_sets: StateValueAndPredictionsSet[])
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
