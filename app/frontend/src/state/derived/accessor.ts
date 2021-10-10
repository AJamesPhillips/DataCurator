import type { RootState } from "../State"



export function get_wc_id_counterfactuals_v2_map (state: RootState)
{
    return state.derived.current_composed_knowledge_view && state.derived.current_composed_knowledge_view.wc_id_counterfactuals_v2_map
}


export function get_wcomponent_counterfactuals_v2 (state: RootState, wcomponent_id?: string)
{
    if (!wcomponent_id) return undefined

    const map = get_wc_id_counterfactuals_v2_map(state)
    return map && map[wcomponent_id]?.VAP_sets
}
