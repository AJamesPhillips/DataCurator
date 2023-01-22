import { get_new_knowledge_view_object } from "../../../knowledge_view/create_new_knowledge_view"
import { ACTIONS } from "../../actions"
import { ensure_any_knowledge_view_displayed } from "../../routing/utils/ensure_any_knowledge_view_displayed"
import type { StoreType } from "../../store"
import { selector_chosen_base_id } from "../../user_info/selector"



// TODO, I'm pretty sure this code is still buggy and creating unnecessary
// knowledge views.  For example `5ab5bb58-53d3-43af-9065-376a64b177c3` was
// created on Nov 1st 2022
export function ensure_a_knowledge_view_subscriber (store: StoreType)
{
    return () =>
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

        const knowledge_view = get_new_knowledge_view_object({ title: "All", base_id }, state.creation_context)
        store.dispatch(ACTIONS.specialised_object.upsert_knowledge_view({ knowledge_view }))
        ensure_any_knowledge_view_displayed(store)
    }
}
