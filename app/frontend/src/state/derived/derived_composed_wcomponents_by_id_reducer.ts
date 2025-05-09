    import { update_substate } from "../../utils/update_state"
import type { RootState } from "../State"
import { get_composed_wcomponents_by_id } from "./get_composed_wcomponents_by_id"



export function derived_composed_wcomponents_by_id_reducer (initial_state: RootState, state: RootState)
{
    const wcomponents_by_id_changed = initial_state.specialised_objects.wcomponents_by_id !== state.specialised_objects.wcomponents_by_id

    // const initial_kv = get_knowledge_view_given_routing(initial_state)
    // const current_kv = get_knowledge_view_given_routing(state)
    // const kv_wc_id_map_changed = initial_kv?.wc_id_map !== current_kv?.wc_id_map

    const initial_composed_visible_wc_id_map = initial_state.derived.current_composed_knowledge_view?.composed_visible_wc_id_map
    const current_composed_visible_wc_id_map = state.derived.current_composed_knowledge_view?.composed_visible_wc_id_map
    const composed_visible_wc_id_map_changed = initial_composed_visible_wc_id_map !== current_composed_visible_wc_id_map

    const need_to_update_composed_wcomponents_by_id = (
        wcomponents_by_id_changed
        // || kv_wc_id_map_changed
        || composed_visible_wc_id_map_changed
    )
    if (!need_to_update_composed_wcomponents_by_id) return state


    const composed_wcomponents_by_id = get_composed_wcomponents_by_id_from_state(state)
    state = update_substate(state, "derived", "composed_wcomponents_by_id", composed_wcomponents_by_id)


    return state
}



function get_composed_wcomponents_by_id_from_state (state: RootState)
{
    const { wcomponents_by_id } = state.specialised_objects
    const { composed_visible_wc_id_map } = state.derived.current_composed_knowledge_view || {}
    const { created_at_ms } = state.routing.args

    return get_composed_wcomponents_by_id({ composed_visible_wc_id_map, wcomponents_by_id, created_at_ms })
}
