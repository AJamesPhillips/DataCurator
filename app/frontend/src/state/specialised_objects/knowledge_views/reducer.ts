import type { AnyAction } from "redux"

import type { KnowledgeView, KnowledgeViewWComponentEntry } from "../../../shared/interfaces/knowledge_view"
import { update_subsubstate } from "../../../utils/update_state"
import type { RootState } from "../../State"
import { is_update_specialised_object_sync_info } from "../../sync/actions"
import { get_knowledge_view_from_state } from "../accessors"
import { is_upsert_wcomponent } from "../wcomponents/actions"
import {
    is_upsert_knowledge_view,
    is_upsert_knowledge_view_entry,
} from "./actions"
import { bulk_editing_knowledge_view_entries_reducer } from "./bulk_edit/reducer"
import { handle_upsert_knowledge_view } from "./utils"



export const knowledge_views_reducer = (state: RootState, action: AnyAction): RootState =>
{

    if (is_upsert_knowledge_view(action))
    {
        state = handle_upsert_knowledge_view(state, action.knowledge_view, action.is_source_of_truth)
    }


    if (is_upsert_wcomponent(action))
    {
        const { wcomponent, add_to_knowledge_view } = action

        if (add_to_knowledge_view)
        {
            const entry: KnowledgeViewWComponentEntry = { ...add_to_knowledge_view.position }
            state = handle_upsert_knowledge_view_entry(state, add_to_knowledge_view.id, wcomponent.id, entry)
        }

        const associated_kv = state.specialised_objects.knowledge_views_by_id[wcomponent.id]
        if (associated_kv && associated_kv.title !== wcomponent.title)
        {
            const updated_knowledge_view = { ...associated_kv, title: wcomponent.title }
            state = handle_upsert_knowledge_view(state, updated_knowledge_view, action.is_source_of_truth)
        }
    }


    if (is_upsert_knowledge_view_entry(action))
    {
        state = handle_upsert_knowledge_view_entry(state, action.knowledge_view_id, action.wcomponent_id, action.entry)
    }


    if (is_update_specialised_object_sync_info(action) && action.object_type === "knowledge_view")
    {
        let kv = get_knowledge_view_from_state(state, action.id)
        if (kv)
        {
            kv = { ...kv, saving: action.saving }
            state = update_subsubstate(state, "specialised_objects", "knowledge_views_by_id", action.id, kv)
        }
        else
        {
            console.error(`Could not find knowledge_view by id: "${action.id}" whilst handling is_update_specialised_object_sync_info`)
        }
    }


    state = bulk_editing_knowledge_view_entries_reducer(state, action)


    return state
}



function handle_upsert_knowledge_view_entry (state: RootState, knowledge_view_id: string, wcomponent_id: string, entry: KnowledgeViewWComponentEntry): RootState
{
    const knowledge_view = get_knowledge_view_from_state(state, knowledge_view_id)

    if (!knowledge_view)
    {
        console.error(`Could not find knowledge_view for id: "${knowledge_view_id}"`)
        return state
    }

    return add_wcomponent_entry_to_knowledge_view(state, knowledge_view, wcomponent_id, entry)
}



function add_wcomponent_entry_to_knowledge_view (state: RootState, knowledge_view: KnowledgeView, wcomponent_id: string, entry: KnowledgeViewWComponentEntry): RootState
{
    let new_wc_id_map = { ...knowledge_view.wc_id_map }

    // Special case changing entry from deleted to re-add to ensure the component
    // gets rendered last and on top of other components
    // And same for passthrough (if it's before the entry has been removed on reloading
    // the knowledge view from the server)
    const existing_entry = new_wc_id_map[wcomponent_id]
    if (existing_entry)
    {
        if ((existing_entry.blocked && !entry.blocked) || (existing_entry.passthrough && !entry.passthrough))
        {
            delete new_wc_id_map[wcomponent_id]
        }
    }

    new_wc_id_map[wcomponent_id] = entry
    // If you want to ensure the new entry is on the bottom then you can do this:
    // new_wc_id_map = { [wcomponent_id]: entry, ...new_wc_id_map }

    const new_knowledge_view = { ...knowledge_view, wc_id_map: new_wc_id_map }

    return handle_upsert_knowledge_view(state, new_knowledge_view)
}
