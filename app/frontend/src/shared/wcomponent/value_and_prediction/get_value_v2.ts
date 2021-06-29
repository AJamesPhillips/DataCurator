import type { CounterfactualStateValueAndPrediction } from "../../counterfactuals/merge"
import type { WComponentCounterfactuals, VAP_id_counterfactual_map } from "../../uncertainty/uncertainty"
import type { VAPsType } from "../interfaces/generic_value"
import type { StateValueAndPredictionsSet } from "../interfaces/state"
import { partition_and_prune_items_by_datetimes } from "../utils_datetime"



interface GetCurrentCounterfactualVAPSetsArgs
{
    values_and_prediction_sets: StateValueAndPredictionsSet[] | undefined
    VAPs_represent: VAPsType
    wc_counterfactuals: WComponentCounterfactuals | undefined
    created_at_ms: number
    sim_ms: number
}
export function get_current_counterfactual_v2_VAP_sets (args: GetCurrentCounterfactualVAPSetsArgs): StateValueAndPredictionsSet | undefined
{
    const { values_and_prediction_sets, VAPs_represent, wc_counterfactuals,
        created_at_ms, sim_ms } = args

    const { present_items } = partition_and_prune_items_by_datetimes({
        items: values_and_prediction_sets || [], created_at_ms, sim_ms,
    })

    const present_item = present_items[0]
    if (!present_item) return undefined


    // const VAP_counterfactuals_maps = Object.values(wc_counterfactuals && wc_counterfactuals.VAP_set || {})
    return present_item//  merge_counterfactuals_into_VAP_set(present_item, VAP_counterfactuals_maps)
}



// function merge_counterfactuals_into_VAP_set (vap_set: StateValueAndPredictionsSet, VAP_counterfactuals_maps: VAP_id_counterfactual_map[]): CounterfactualStateValueAndPrediction | undefined
// {

// }

