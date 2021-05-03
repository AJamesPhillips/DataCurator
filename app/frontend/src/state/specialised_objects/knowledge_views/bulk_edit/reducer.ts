import type { AnyAction } from "redux"

import type { RootState } from "../../../State"
import { get_current_knowledge_view_from_state } from "../../accessors"
import { handle_upsert_knowledge_view } from "../utils"
import { is_bulk_edit_knowledge_view_entries } from "./actions"



export const bulk_editing_knowledge_view_entries_reducer = (state: RootState, action: AnyAction): RootState =>
{

    if (is_bulk_edit_knowledge_view_entries(action))
    {
        const { wcomponent_ids, change_left, change_top } = action

        const kv = get_current_knowledge_view_from_state(state)
        if (kv)
        {
            const new_wc_id_map = { ...kv.wc_id_map }

            wcomponent_ids.forEach(id =>
            {
                const existing_entry = kv.wc_id_map[id]
                if (!existing_entry) return

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

    return state
}
