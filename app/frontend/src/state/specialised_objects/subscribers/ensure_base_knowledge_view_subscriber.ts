import type { Store } from "redux"

import { get_new_knowledge_view_object } from "../../../knowledge_view/create_new_knowledge_view"
import { ACTIONS } from "../../actions"
import { ensure_any_knowledge_view_displayed } from "../../routing/utils/ensure_any_knowledge_view_displayed"
import type { RootState } from "../../State"
import { get_base_knowledge_view } from "../accessors"



export function ensure_base_knowledge_view_subscriber (store: Store<RootState>)
{
    return () =>
    {
        const state = store.getState()

        if (!state.sync.ready_for_reading) return

        if (state.derived.base_knowledge_view) return

        // double check
        const base_knowledge_view = get_base_knowledge_view(Object.values(state.specialised_objects.knowledge_views_by_id))
        if (base_knowledge_view)
        {
            console.error("Should have set base_knowledge_view by now but state.derived.base_knowledge_view is undefined")
            return
        }

        const knowledge_view = get_new_knowledge_view_object({ title: "Base", is_base: true }, state.creation_context)
        store.dispatch(ACTIONS.specialised_object.upsert_knowledge_view({ knowledge_view }))
        ensure_any_knowledge_view_displayed(store)
    }
}
