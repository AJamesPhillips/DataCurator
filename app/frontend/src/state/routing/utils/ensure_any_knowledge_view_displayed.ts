import {
    calculate_spatial_temporal_position_to_move_to,
} from "../../../canvas/calculate_spatial_temporal_position_to_move_to"
import type { KnowledgeView } from "../../../shared/interfaces/knowledge_view"
import { ACTIONS } from "../../actions"
import { get_actually_display_time_sliders } from "../../controls/accessors"
import type { ComposedKnowledgeView } from "../../derived/State"
import {
    update_composed_knowledge_view_filters,
    update_current_composed_knowledge_view_state,
} from "../../specialised_objects/knowledge_views/knowledge_views_derived_reducer"
import type { RootState } from "../../State"
import type { StoreType } from "../../store"
import { selector_chosen_base } from "../../user_info/selector"



export function ensure_any_knowledge_view_displayed (store: StoreType)
{
    const state = store.getState()

    if (!current_knowledge_view_is_valid(state))
    {
        const base = selector_chosen_base(state)
        const default_knowledge_view = state.specialised_objects.knowledge_views_by_id[base?.default_knowledge_view_id || ""]
        const a_random_knowledge_view = state.derived.knowledge_views[0]
        const a_knowledge_view = default_knowledge_view || a_random_knowledge_view
        const display_side_panel = state.controls.display_side_panel
        const display_time_sliders = get_actually_display_time_sliders(state)

        const pos = optionally_calculate_spatial_temporal_position_to_move_to(state, a_knowledge_view, display_side_panel, display_time_sliders)
        const args = { subview_id: a_knowledge_view?.id, ...pos }
        store.dispatch(ACTIONS.routing.change_route({ args }))
    }
}


function current_knowledge_view_is_valid (state: RootState)
{
    const { subview_id } = state.routing.args

    return !!state.specialised_objects.knowledge_views_by_id[subview_id]
}



function optionally_calculate_spatial_temporal_position_to_move_to (state: RootState, current_kv: KnowledgeView | undefined, display_side_panel: boolean, display_time_sliders: boolean): Partial<{ x: number, y: number, z: number, created_at_ms: number }>
{
    if (!current_kv) return {}

    let current_composed_knowledge_view: ComposedKnowledgeView | undefined = update_current_composed_knowledge_view_state(state, current_kv)
    current_composed_knowledge_view = update_composed_knowledge_view_filters(state, current_composed_knowledge_view)
    if (!current_composed_knowledge_view) return {}

    const { wcomponents_by_id } = state.specialised_objects
    const initial_wcomponent_id = state.routing.item_id || ""
    const { created_at_ms } = state.routing.args
    const { selected_wcomponent_ids_set } = state.meta_wcomponents

    const pos = calculate_spatial_temporal_position_to_move_to({
        current_composed_knowledge_view,
        wcomponents_by_id,
        initial_wcomponent_id,
        selected_wcomponent_ids_set,
        created_at_ms,
        disable_if_not_present: false,
        display_side_panel,
        display_time_sliders,
    })

    return {
        ...pos.positions[0], // may be undefined
        created_at_ms: pos.go_to_datetime_ms,
    }
}
