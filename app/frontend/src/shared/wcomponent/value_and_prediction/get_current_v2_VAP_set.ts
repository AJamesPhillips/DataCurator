import type { StateValueAndPredictionsSet } from "../interfaces/state"
import { partition_and_prune_items_by_datetimes_and_versions } from "./utils"



interface GetCurrentCounterfactualVAPSetsArgs
{
    values_and_prediction_sets: StateValueAndPredictionsSet[] | undefined
    created_at_ms: number
    sim_ms: number
}
// CARNAGE
export function get_current_VAP_set (args: GetCurrentCounterfactualVAPSetsArgs): StateValueAndPredictionsSet | undefined
{
    const {
        values_and_prediction_sets,
        created_at_ms, sim_ms,
    } = args

    const { present_items } = partition_and_prune_items_by_datetimes_and_versions({
        items: values_and_prediction_sets || [], created_at_ms, sim_ms,
    })

    const VAP_set = present_items[0]
    if (!VAP_set) return undefined

    return VAP_set
}
