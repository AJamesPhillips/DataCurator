import type { AnyAction } from "redux"

import type { KnowledgeViewWComponentEntry } from "../../../shared/wcomponent/interfaces/knowledge_view"
import type { KnowledgeView } from "../../../shared/wcomponent/interfaces/knowledge_view"
import { update_substate } from "../../../utils/update_state"
import type { RootState } from "../../State"
import {get_knowledge_view_from_state } from "../accessors"
import { is_upsert_wcomponent } from "../wcomponents/actions"
import {
    is_upsert_knowledge_view,
    is_upsert_knowledge_view_entry,
    is_delete_knowledge_view_entry,
} from "./actions"
import { bulk_editing_knowledge_view_entries_reducer } from "./bulk_edit/reducer"
import { handle_upsert_knowledge_view } from "./utils"



export const knowledge_views_reducer = (state: RootState, action: AnyAction): RootState =>
{

    if (is_upsert_knowledge_view(action))
    {
        state = handle_upsert_knowledge_view(state, action.knowledge_view, action.source_of_truth)
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
    const new_knowledge_view = update_substate(knowledge_view, "wc_id_map", wcomponent_id, entry)

    return handle_upsert_knowledge_view(state, new_knowledge_view, true)
}

function handle_delete_knowledge_view_entry (state: RootState, knowledge_view_id: string, wcomponent_id: string): RootState
{
    const knowledge_view = get_knowledge_view_from_state(state, knowledge_view_id)

    if (!knowledge_view)
    {
        console.error(`Could not find knowledge_view for id: "${knowledge_view_id}"`)
        return state
    }

    const new_wc_id_map = { ...knowledge_view.wc_id_map }
    new_wc_id_map[wcomponent_id] = { ...new_wc_id_map[wcomponent_id]!, deleted: true }
    const new_knowledge_view = { ...knowledge_view, wc_id_map: new_wc_id_map }

    return handle_upsert_knowledge_view(state, new_knowledge_view, true)
}



function add_wcomponent_to_base_knowledge_view (state: RootState, wcomponent_id: string, entry: KnowledgeViewWComponentEntry): RootState
{
    const { base_knowledge_view } = state.derived
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
