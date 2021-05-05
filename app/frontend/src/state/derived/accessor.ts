import type { RootState } from "../State"



export function get_wcomponent_counterfactuals (state: RootState, wcomponent_id: string)
{
    return state.derived.current_UI_knowledge_view && state.derived.current_UI_knowledge_view.wc_id_counterfactuals_map[wcomponent_id]
}


export function get_wcomponent_VAP_set_counterfactuals (state: RootState, wcomponent_id: string)
{
    const counterfactuals = get_wcomponent_counterfactuals(state, wcomponent_id)
    return counterfactuals && counterfactuals.VAP_set
}
