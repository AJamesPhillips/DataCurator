import type { KnowledgeView, KnowledgeViewWComponentIdEntryMap } from "../../../shared/models/interfaces/SpecialisedObjects"
import { sort_list } from "../../../shared/utils/sort"
import { update_substate } from "../../../utils/update_state"
import type { DerivedUIKnowledgeView } from "../../derived/State"
import type { RootState } from "../../State"
import { get_base_knowledge_view } from "../accessors"



export const knowledge_views_derived_reducer = (initial_state: RootState, state: RootState): RootState =>
{

    if (initial_state.specialised_objects.knowledge_views_by_id !== state.specialised_objects.knowledge_views_by_id)
    {
        state = update_derived_knowledge_view_state(state)
    }


    if (state.routing.args.view === "knowledge")
    {
        const current_kv_id = state.routing.args.subview_id
        let need_update = false
        if (initial_state.routing.args.subview_id !== current_kv_id)
        {
            need_update = true
            state = update_substate(state, "derived", "current_UI_knowledge_view", undefined)
        }

        const initial_kv = get_knowledge_view(initial_state, current_kv_id)
        const current_kv = get_knowledge_view(state, current_kv_id)
        need_update = need_update || initial_kv !== current_kv

        if (need_update && current_kv)
        {
            state = update_UI_current_knowledge_view_state(initial_state, state, current_kv)
        }
    }
    else if (state.derived.current_UI_knowledge_view)
    {
        state = update_substate(state, "derived", "current_UI_knowledge_view", undefined)
    }


    return state
}



function update_derived_knowledge_view_state (state: RootState): RootState
{
    const knowledge_views = sort_list(
        Object.values(state.specialised_objects.knowledge_views_by_id),
        ({ created_at }) => created_at.getTime(),
        "ascending"
    )
    state = update_substate(state, "derived", "knowledge_views", knowledge_views)


    const {
        base_knowledge_view,
        other_knowledge_views,
    } = get_base_knowledge_view(state)

    state = {
        ...state,
        derived: {
            ...state.derived,
            base_knowledge_view,
            other_knowledge_views,
        },
    }

    return state
}



function get_knowledge_view (state: RootState, id: string)
{
    return state.specialised_objects.knowledge_views_by_id[id]
}



function update_UI_current_knowledge_view_state (intial_state: RootState, state: RootState, current_kv: KnowledgeView): RootState
{
    const { current_UI_knowledge_view: current_UI_kv } = state.derived
    const to_compose: KnowledgeViewWComponentIdEntryMap[] = []
    let previous_update = false


    if (current_UI_kv) to_compose.push(current_UI_kv.derived_wc_id_map)
    else previous_update = true


    const foundation_knowledge_view_ids = current_kv.foundation_knowledge_view_ids || []

    foundation_knowledge_view_ids.forEach(id =>
    {
        const initial_kv = get_knowledge_view(intial_state, id)
        const new_kv = get_knowledge_view(state, id)

        if (new_kv && (previous_update || !initial_kv || initial_kv.wc_id_map !== new_kv.wc_id_map))
        {
            to_compose.push(new_kv.wc_id_map)
            previous_update = true
        }
    })


    to_compose.push(current_kv.wc_id_map)
    const derived_wc_id_map = Object.assign({}, ...to_compose) as KnowledgeViewWComponentIdEntryMap
    const current_UI_knowledge_view: DerivedUIKnowledgeView = { ...current_kv, derived_wc_id_map }
    // do not need to do this but helps reduce confusion when debugging
    delete (current_UI_knowledge_view as any).wc_id_map

    state = update_substate(state, "derived", "current_UI_knowledge_view", current_UI_knowledge_view)

    return state
}
