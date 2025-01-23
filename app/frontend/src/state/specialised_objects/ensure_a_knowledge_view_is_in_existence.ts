import { get_new_knowledge_view_object } from "../../knowledge_view/create_new_knowledge_view"
import { ACTIONS } from "../actions"
import type { StoreType } from "../store"
import { selector_chosen_base_id } from "../user_info/selector"



export function ensure_a_knowledge_view_is_in_existence (store: StoreType)
{
    const state = store.getState()

    // TODO, check this is negative when changing base
    if (!state.sync.ready_for_reading) return

    if (state.derived.knowledge_views.length) return

    const base_id = selector_chosen_base_id(state)
    if (base_id === undefined)
    {
        console.error("Can not create knowledge view without chosen_base_id")
        return
    }

    // This is still buggy as of 2025-01-23.  It creates a new knowledge view
    // when (I think) the user's browser is forcibly refreshed to get a new
    // JWT token from supabase.  So it's likely that the `state.sync.ready_for_reading`
    // is not being correctly set to false rather than the `state.derived.knowledge_views`
    // being incorrectly cleared (as this is a good defensive move to avoid a
    // user signing out and back in with a different user and keeping the old
    // content in `state.derived.knowledge_views`).
    const knowledge_view = get_new_knowledge_view_object({ title: "All", base_id }, state.creation_context)
    store.dispatch(ACTIONS.specialised_object.upsert_knowledge_view({ knowledge_view }))
}
