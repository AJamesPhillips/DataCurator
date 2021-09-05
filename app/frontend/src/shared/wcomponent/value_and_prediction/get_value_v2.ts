import { wcomponent_has_knowledge_view } from "../../../state/specialised_objects/accessors"
import type { VAP_set_id_counterfactual_mapV2 } from "../../uncertainty/uncertainty"
import type { ComposedCounterfactualStateValueAndPredictionSetV2, TargetVAPIdCounterfactualEntry, TargetVAPIdCounterfactualMap, WComponentCounterfactualV2 } from "../interfaces/counterfactual"
import type { KnowledgeViewsById } from "../interfaces/knowledge_view"
import type { StateValueAndPredictionsSet } from "../interfaces/state"
import { partition_and_prune_items_by_datetimes_and_versions } from "./utils"



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

    const { present_items } = partition_and_prune_items_by_datetimes_and_versions({
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
        active_counterfactual_v2_ids = [],
    } = args

    const counterfactual_v2 = cf_map && cf_map[VAP_set.id]
    const active_cf_ids = new Set(active_counterfactual_v2_ids)

    return merge_counterfactuals_v2_into_composed_VAP_set(VAP_set, counterfactual_v2, active_cf_ids, args.knowledge_views_by_id)
}



function merge_counterfactuals_v2_into_composed_VAP_set (
    VAP_set: StateValueAndPredictionsSet,
    counterfactuals_v2: WComponentCounterfactualV2[] = [],
    active_cf_ids: Set<string>,
    knowledge_views_by_id: KnowledgeViewsById,
): ComposedCounterfactualStateValueAndPredictionSetV2
{
    let is_counterfactual = false
    const target_VAP_id_counterfactual_map: TargetVAPIdCounterfactualMap = {}
    let active_counterfactual_v2_id: string | undefined = undefined

    counterfactuals_v2.forEach(cf =>
    {
        if (active_cf_ids.has(cf.id))
        {
            VAP_set = { ...VAP_set, ...cf.counterfactual_VAP_set }
            is_counterfactual = true
            active_counterfactual_v2_id = cf.id
        }

        const target_VAP_id = cf.counterfactual_VAP_set && cf.counterfactual_VAP_set.target_VAP_id
        if (!target_VAP_id) return

        const counterfactual_has_knowledge_view = wcomponent_has_knowledge_view(cf.id, knowledge_views_by_id)
        const entry: TargetVAPIdCounterfactualEntry = {
            counterfactual_v2_id: cf.id,
            counterfactual_has_knowledge_view,
        }

        const cf_data = target_VAP_id_counterfactual_map[target_VAP_id] || []
        cf_data.push(entry)
        target_VAP_id_counterfactual_map[target_VAP_id] = cf_data
    })

    return {
        ...VAP_set,
        is_counterfactual,
        target_VAP_id_counterfactual_map,
        active_counterfactual_v2_id
    }
}
