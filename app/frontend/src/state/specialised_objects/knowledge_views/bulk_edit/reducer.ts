import type { AnyAction } from "redux"

import type {
    KnowledgeViewWComponentIdEntryMap,
    KnowledgeView,
} from "../../../../shared/wcomponent/interfaces/knowledge_view"
import type { RootState } from "../../../State"
import {
    get_current_knowledge_view_from_state,
    get_current_UI_knowledge_view_from_state,
} from "../../accessors"
import { handle_upsert_knowledge_view } from "../utils"
import { is_bulk_add_to_knowledge_view, is_bulk_edit_knowledge_view_entries } from "./actions"



export const bulk_editing_knowledge_view_entries_reducer = (state: RootState, action: AnyAction): RootState =>
{

    if (is_bulk_edit_knowledge_view_entries(action))
    {
        const { wcomponent_ids, change_left, change_top } = action

        const kv = get_current_knowledge_view_from_state(state)
        const UI_kv = get_current_UI_knowledge_view_from_state(state)
        if (kv && UI_kv)
        {
            const new_wc_id_map = { ...kv.wc_id_map }

            wcomponent_ids.forEach(id =>
            {
                const existing_entry = UI_kv.derived_wc_id_map[id]!

                const new_entry = { ...existing_entry }

                new_entry.left += change_left
                new_entry.top += change_top

                new_wc_id_map[id] = new_entry
            })

            const new_kv = { ...kv, wc_id_map: new_wc_id_map }

            state = handle_upsert_knowledge_view(state, new_kv)
        }
        else
        {
            console.error("There should always be a current knowledge view if bulk editing position of world components")
        }
    }


    if (is_bulk_add_to_knowledge_view(action))
    {
        const { knowledge_view_id, wcomponent_ids } = action

        const kv = state.specialised_objects.knowledge_views_by_id[knowledge_view_id]
        const UI_kv = get_current_UI_knowledge_view_from_state(state)

        if (kv && UI_kv)
        {
            let new_wc_id_map: KnowledgeViewWComponentIdEntryMap = {}


            wcomponent_ids.forEach(id =>
            {
                const entry = UI_kv.derived_wc_id_map[id]
                if (!entry)
                {
                    console.error(`we should always have an entry but wcomponent "${id}" lacking entry in UI_kv derived_wc_id_map for "${knowledge_view_id}"`)
                    return
                }
                new_wc_id_map[id] = entry
            })

            new_wc_id_map = { ...new_wc_id_map, ...kv.wc_id_map }


            const new_kv: KnowledgeView = { ...kv, wc_id_map: new_wc_id_map }
            state = handle_upsert_knowledge_view(state, new_kv)
        }
        else
        {
            if (!kv)
            {
                console.error(`Could not find knowledge view for bulk_add_to_knowledge_view by id: "${knowledge_view_id}"`)
            }
            else
            {
                console.error("There should always be a current knowledge view if bulk editing position of world components")
            }
        }
    }


    return state
}
