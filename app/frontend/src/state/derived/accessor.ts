import type { RootState } from "../State"



export function get_wc_id_counterfactuals_map (state: RootState)
{
    return state.derived.current_UI_knowledge_view && state.derived.current_UI_knowledge_view.wc_id_counterfactuals_map
}


export function get_wcomponent_counterfactuals (state: RootState, wcomponent_id: string)
{
    const map = get_wc_id_counterfactuals_map(state)
    return map && map[wcomponent_id]
}


export function get_wcomponent_VAP_set_counterfactuals (state: RootState, wcomponent_id: string)
{
    const counterfactuals = get_wcomponent_counterfactuals(state, wcomponent_id)
    return counterfactuals && counterfactuals.VAP_set
}
