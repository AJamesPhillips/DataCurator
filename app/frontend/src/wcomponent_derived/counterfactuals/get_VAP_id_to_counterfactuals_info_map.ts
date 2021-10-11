import { wcomponent_has_knowledge_view } from "../../state/specialised_objects/accessors"
import type { KnowledgeViewsById } from "../../shared/interfaces/knowledge_view"
import type {
    TargetVAPIdCounterfactualInfoMap,
    TargetVAPIdCounterfactualInfoEntry,
} from "../../wcomponent/interfaces/counterfactual"
import type { StateValueAndPredictionsSet } from "../../wcomponent/interfaces/state"
import type { VAPSetIdToCounterfactualV2Map } from "../interfaces/counterfactual"



interface GetVAPCounterfactualsMapArgs
{
    VAP_set: StateValueAndPredictionsSet
    VAP_set_id_to_counterfactual_v2_map: VAPSetIdToCounterfactualV2Map | undefined
    knowledge_views_by_id: KnowledgeViewsById
}
export function get_VAP_id_to_counterfactuals_info_map (args: GetVAPCounterfactualsMapArgs)
{
    const {
        VAP_set,
        VAP_set_id_to_counterfactual_v2_map,
        knowledge_views_by_id,
    } = args

    const counterfactuals_v2 = VAP_set_id_to_counterfactual_v2_map?.[VAP_set.id] || []


    const target_VAP_id_counterfactual_map: TargetVAPIdCounterfactualInfoMap = {}

    counterfactuals_v2.forEach(cf =>
    {
        const { target_VAP_id } = cf
        if (!target_VAP_id) return

        const counterfactual_has_knowledge_view = wcomponent_has_knowledge_view(cf.id, knowledge_views_by_id)
        const entry: TargetVAPIdCounterfactualInfoEntry = {
            counterfactual_v2_id: cf.id,
            counterfactual_has_knowledge_view,
        }

        const cf_data = target_VAP_id_counterfactual_map[target_VAP_id] || []
        cf_data.push(entry)
        target_VAP_id_counterfactual_map[target_VAP_id] = cf_data
    })

    return target_VAP_id_counterfactual_map
}
