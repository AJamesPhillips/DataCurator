import type { VAP_set_id_counterfactual_mapV2 } from "../../../shared/uncertainty/uncertainty"
import type { WComponent } from "../../../shared/wcomponent/interfaces/SpecialisedObjects"
import type { RootState } from "../../State"
import { get_current_composed_knowledge_view_from_state } from "../accessors"



export function get_props_for_get_counterfactual_v2_VAP_set (wcomponent: WComponent, state: RootState)
{
    const current_composed_kv = get_current_composed_knowledge_view_from_state(state)

    let VAP_set_counterfactuals_map: VAP_set_id_counterfactual_mapV2 | undefined = undefined
    let active_counterfactual_v2_ids: string[] | undefined = undefined
    if (current_composed_kv)
    {
        active_counterfactual_v2_ids = current_composed_kv.active_counterfactual_v2_ids

        const cf = current_composed_kv.wc_id_counterfactuals_v2_map[wcomponent.id]
        VAP_set_counterfactuals_map = cf && cf.VAP_set
    }

    return {
        VAP_set_counterfactuals_map,
        active_counterfactual_v2_ids,
        knowledge_views_by_id: state.specialised_objects.knowledge_views_by_id,
    }
}
