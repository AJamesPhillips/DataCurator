import type { RootState } from "../State"



export function get_wc_id_to_counterfactuals_v2_map (state: RootState, active=true)
{
    if (active) return state.derived.current_composed_knowledge_view?.wc_id_to_active_counterfactuals_v2_map
    return state.derived.current_composed_knowledge_view?.wc_id_to_counterfactuals_v2_map
}


export function get_VAP_set_id_to_counterfactual_v2_map (state: RootState, wcomponent_id?: string)
{
    if (!wcomponent_id) return undefined

    const map = get_wc_id_to_counterfactuals_v2_map(state)
    return map && map[wcomponent_id]?.VAP_sets
}



export function get_overlapping_wcomponent_ids (state: RootState, wcomponent_id: string)
{
    const { overlapping_wc_ids = {} } = state.derived.current_composed_knowledge_view || {}
    return overlapping_wc_ids[wcomponent_id]
}
