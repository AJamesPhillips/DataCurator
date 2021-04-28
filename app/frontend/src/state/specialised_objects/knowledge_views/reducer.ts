import type { AnyAction } from "redux"

import type { KnowledgeView, KnowledgeViewWComponentEntry } from "../../../shared/models/interfaces/SpecialisedObjects"
import { upsert_entry, replace_element } from "../../../utils/list"
import { update_substate } from "../../../utils/update_state"
import type { RootState } from "../../State"
import { get_base_knowledge_view, get_knowledge_view_from_state } from "../accessors"
import { is_upsert_wcomponent } from "../wcomponents/actions"
import {
    is_upsert_knowledge_view,
    is_upsert_knowledge_view_entry,
    is_delete_knowledge_view_entry,
} from "./actions"
import { bulk_editing_knowledge_view_entries_reducer } from "./bulk_edit/reducer"



export const knowledge_views_reducer = (state: RootState, action: AnyAction): RootState =>
{
    if (is_upsert_knowledge_view(action))
    {
        state = handle_upsert_knowledge_view(state, action.knowledge_view)
    }


    if (is_upsert_wcomponent(action))
    {
        const { wcomponent, add_to_knowledge_view } = action

        if (add_to_knowledge_view)
        {
            const entry: KnowledgeViewWComponentEntry = { ...add_to_knowledge_view.position }
            state = handle_upsert_knowledge_view_entry(state, add_to_knowledge_view.id, wcomponent.id, entry)

            state = add_wcomponent_to_base_knowledge_view(state, wcomponent.id, entry)
        }
    }


    if (is_upsert_knowledge_view_entry(action))
    {
        state = handle_upsert_knowledge_view_entry(state, action.knowledge_view_id, action.wcomponent_id, action.entry)
    }


    if (is_delete_knowledge_view_entry(action))
    {
        state = handle_delete_knowledge_view_entry(state, action.knowledge_view_id, action.wcomponent_id)
    }


    state = bulk_editing_knowledge_view_entries_reducer(state, action)


    return state
}



function handle_upsert_knowledge_view (state: RootState, knowledge_view: KnowledgeView)
{
    const knowledge_views = state.specialised_objects.knowledge_views
    const new_knowledge_views = upsert_entry(
        knowledge_views,
        knowledge_view,
        kv => kv.id === knowledge_view.id,
        "specialised_objects.knowledge_views")

    return update_substate(state, "specialised_objects", "knowledge_views", new_knowledge_views)
}



function handle_upsert_knowledge_view_entry (state: RootState, knowledge_view_id: string, wcomponent_id: string, entry: KnowledgeViewWComponentEntry)
{
    const knowledge_view = get_knowledge_view_from_state(state, knowledge_view_id)

    if (!knowledge_view) throw new Error(`Could not find knowledge_view for id: "${knowledge_view_id}"`)

    return add_wcomponent_entry_to_knowledge_view(state, knowledge_view, wcomponent_id, entry)
}



function add_wcomponent_entry_to_knowledge_view(state: RootState, knowledge_view: KnowledgeView, wcomponent_id: string, entry: KnowledgeViewWComponentEntry): RootState
{
    const new_knowledge_view = update_substate(knowledge_view, "wc_id_map", wcomponent_id, entry)

    const knowledge_views = state.specialised_objects.knowledge_views
    const new_knowledge_views = replace_element(knowledge_views, new_knowledge_view, kv => kv.id === knowledge_view.id)

    return update_substate(state, "specialised_objects", "knowledge_views", new_knowledge_views)
}

function handle_delete_knowledge_view_entry (state: RootState, knowledge_view_id: string, wcomponent_id: string)
{
    const knowledge_view = get_knowledge_view_from_state(state, knowledge_view_id)

    if (!knowledge_view) throw new Error(`Could not find knowledge_view for id: "${knowledge_view_id}"`)

    const wc_id_map = { ...knowledge_view.wc_id_map }
    delete wc_id_map[wcomponent_id]
    const new_knowledge_view = {
        ...knowledge_view,
        wc_id_map,
    }

    const knowledge_views = state.specialised_objects.knowledge_views
    const new_knowledge_views = replace_element(knowledge_views, new_knowledge_view, kv => kv.id === knowledge_view_id)

    return update_substate(state, "specialised_objects", "knowledge_views", new_knowledge_views)
}



function add_wcomponent_to_base_knowledge_view(state: RootState, wcomponent_id: string, entry: KnowledgeViewWComponentEntry): RootState
{
    const { base_knowledge_view } = get_base_knowledge_view(state)
    if (!base_knowledge_view)
    {
        console.error("There should always be a base knowledge view once wcomponents are being added")
        return state
    }

    const existing_entry = base_knowledge_view.wc_id_map[wcomponent_id]

    if (existing_entry)
    {
        // Nothing needs to be done
        return state
    }

    return add_wcomponent_entry_to_knowledge_view(state, base_knowledge_view, wcomponent_id, entry)
}
