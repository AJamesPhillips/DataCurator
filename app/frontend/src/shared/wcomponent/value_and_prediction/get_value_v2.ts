import { wcomponent_has_knowledge_view } from "../../../state/specialised_objects/accessors"
import type { CounterfactualStateValueAndPredictionSetV2 } from "../../counterfactuals/interfaces"
import type { VAP_set_id_counterfactual_mapV2 } from "../../uncertainty/uncertainty"
import type { WComponentCounterfactualV2 } from "../interfaces/counterfactual"
import type { KnowledgeViewsById } from "../interfaces/knowledge_view"
import type { StateValueAndPredictionsSet } from "../interfaces/state"
import { partition_and_prune_items_by_datetimes } from "../utils_datetime"



interface GetCurrentCounterfactualVAPSetsArgs
{
    values_and_prediction_sets: StateValueAndPredictionsSet[] | undefined
    created_at_ms: number
    sim_ms: number
}
export function get_current_VAP_set (args: GetCurrentCounterfactualVAPSetsArgs): StateValueAndPredictionsSet | undefined
{
    const {
        values_and_prediction_sets,
        created_at_ms, sim_ms,
    } = args

    const { present_items } = partition_and_prune_items_by_datetimes({
        items: values_and_prediction_sets || [], created_at_ms, sim_ms,
    })

    const VAP_set = present_items[0]
    if (!VAP_set) return undefined

    return VAP_set
}



interface GetCounterfactualV2VAPSetArgs
{
    VAP_set: StateValueAndPredictionsSet
    VAP_set_counterfactuals_map: VAP_set_id_counterfactual_mapV2 | undefined
    active_counterfactual_v2_ids: string[] | undefined
    knowledge_views_by_id: KnowledgeViewsById
}
export function get_counterfactual_v2_VAP_set (args: GetCounterfactualV2VAPSetArgs)
{
    const {
        VAP_set,
        VAP_set_counterfactuals_map: cf_map,
        active_counterfactual_v2_ids,
    } = args

    const counterfactual_v2 = cf_map && cf_map[VAP_set.id]
    const active_counterfactuals = filter_counterfactuals_v2_to_active(counterfactual_v2, active_counterfactual_v2_ids || [])

    return merge_counterfactuals_v2_into_VAP_set(VAP_set, active_counterfactuals, args.knowledge_views_by_id)
}



function filter_counterfactuals_v2_to_active (counterfactuals_v2: WComponentCounterfactualV2[] = [], active_counterfactual_v2_ids: string[]): WComponentCounterfactualV2[]
{
    const ids = new Set(active_counterfactual_v2_ids)
    return counterfactuals_v2.filter(cf => ids.has(cf.id))
}



function merge_counterfactuals_v2_into_VAP_set (VAP_set: StateValueAndPredictionsSet, counterfactuals_v2: WComponentCounterfactualV2[] = [], knowledge_views_by_id: KnowledgeViewsById): CounterfactualStateValueAndPredictionSetV2
{
    let is_counterfactual = false
    let active_counterfactual_v2_id: string | undefined = undefined
    let active_counterfactual_has_knowledge_view: boolean | undefined = undefined

    counterfactuals_v2.forEach(cf =>
    {
        is_counterfactual = true
        VAP_set = { ...VAP_set, ...cf.counterfactual_VAP_set }

        active_counterfactual_v2_id = cf.id

        const has_knowledge_view = wcomponent_has_knowledge_view(cf.id, knowledge_views_by_id)
        active_counterfactual_has_knowledge_view = has_knowledge_view
    })

    return {
        ...VAP_set,
        is_counterfactual,
        active_counterfactual_v2_id,
        active_counterfactual_has_knowledge_view,
    }
}
