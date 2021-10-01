import type { VAP_set_id_counterfactual_mapV2 } from "../../../shared/uncertainty/uncertainty"
import type { RootState } from "../../State"
import { get_current_composed_knowledge_view_from_state } from "../accessors"



export function get_partial_args_for_get_counterfactual_v2_VAP_set (wcomponent_id: string, state: RootState)
{
    const current_composed_kv = get_current_composed_knowledge_view_from_state(state)

    let active_counterfactual_v2_ids: string[] | undefined = undefined
    let VAP_set_ids_to_counterfactuals_map: VAP_set_id_counterfactual_mapV2 | undefined = undefined
    if (current_composed_kv)
    {
        active_counterfactual_v2_ids = current_composed_kv.active_counterfactual_v2_ids

        const CFs_by_attribute = current_composed_kv.wc_id_counterfactuals_v2_map[wcomponent_id]
        VAP_set_ids_to_counterfactuals_map = CFs_by_attribute?.VAP_sets // filter by active_counterfactual_v2_ids here?
    }

    return {
        active_counterfactual_v2_ids,
        VAP_set_ids_to_counterfactuals_map,
        knowledge_views_by_id: state.specialised_objects.knowledge_views_by_id,
    }
}
