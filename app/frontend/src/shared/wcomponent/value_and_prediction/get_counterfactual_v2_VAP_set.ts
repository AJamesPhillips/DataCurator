import { wcomponent_has_knowledge_view } from "../../../state/specialised_objects/accessors"
import type { KnowledgeViewsById } from "../../interfaces/knowledge_view"
import type { VAP_set_id_counterfactual_mapV2 } from "../../uncertainty/uncertainty"
import type { TargetVAPIdCounterfactualMap, TargetVAPIdCounterfactualEntry } from "../interfaces/counterfactual"
import type { StateValueAndPredictionsSet } from "../interfaces/state"



interface GetCounterfactualV2VAPSetArgs
{
    VAP_set: StateValueAndPredictionsSet
    VAP_set_ids_to_counterfactuals_map: VAP_set_id_counterfactual_mapV2 | undefined
    active_counterfactual_v2_ids: string[] | undefined
    knowledge_views_by_id: KnowledgeViewsById
}
export function get_counterfactual_v2_VAP_set (args: GetCounterfactualV2VAPSetArgs)
{
    const {
        VAP_set_ids_to_counterfactuals_map,
        active_counterfactual_v2_ids = [],
        knowledge_views_by_id,
    } = args
    let { VAP_set } = args


    const counterfactuals_v2 = VAP_set_ids_to_counterfactuals_map?.[VAP_set.id] || []
    const active_cf_ids = new Set(active_counterfactual_v2_ids)


    let has_counterfactual_applied = false
    const target_VAP_id_counterfactual_map: TargetVAPIdCounterfactualMap = {}
    let active_counterfactual_v2_id: string | undefined = undefined

    counterfactuals_v2.forEach(cf =>
    {
        const { target_VAP_id } = cf
        if (!target_VAP_id) return

        if (active_cf_ids.has(cf.id) && !has_counterfactual_applied)
        {
            VAP_set = clean_VAP_set_for_counterfactual(VAP_set, target_VAP_id)
            has_counterfactual_applied = true
            active_counterfactual_v2_id = cf.id
        }

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
        has_counterfactual_applied,
        target_VAP_id_counterfactual_map,
        active_counterfactual_v2_id
    }
}



interface CoreCounterfactualStateValueAndPredictionSetV2 extends StateValueAndPredictionsSet
{
    target_VAP_id: string | undefined
}

function clean_VAP_set_for_counterfactual (VAP_set: StateValueAndPredictionsSet, target_VAP_id: string | undefined): CoreCounterfactualStateValueAndPredictionSetV2
{
    const shared_entry_values = {
        ...VAP_set.shared_entry_values,
        conviction: 1,
    }


    if (target_VAP_id === undefined)
    {
        target_VAP_id = VAP_set.entries[0]?.id
    }


    const entries = VAP_set.entries.map(entry =>
    {
        const probability = entry.id === target_VAP_id ? 1 : 0
        return { ...entry, probability, relative_probability: 0, conviction: 1 }
    })


    return { ...VAP_set, shared_entry_values, entries, target_VAP_id }
}
