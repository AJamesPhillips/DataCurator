import type { AnyAction } from "redux"

import { replace_element } from "../../../../utils/list"
import { update_substate } from "../../../../utils/update_state"
import type { RootState } from "../../../State"
import { get_current_knowledge_view_from_state } from "../../accessors"
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
                const new_entry = { ...kv.wc_id_map[id] }

                new_entry.left += change_left
                new_entry.top += change_top

                new_wc_id_map[id] = new_entry
            })

            const new_kv = { ...kv, wc_id_map: new_wc_id_map }

            const new_knowledge_views = replace_element(state.specialised_objects.knowledge_views, new_kv, ({ id }) => id === new_kv.id)
            state = update_substate(state, "specialised_objects", "knowledge_views", new_knowledge_views)
        }

    }

    return state
}
