import { ensure_item_in_set, ensure_item_not_in_set } from "../../utils/set"
import { update_subsubstate } from "../../utils/update_state"
import type { RootState } from "../State"
import type { SPECIALISED_OBJECT_TYPE } from "./actions"



export function update_specialised_object_ids_pending_save (state: RootState, object_type: SPECIALISED_OBJECT_TYPE, id: string, pending_save: boolean)
{
    let { wcomponent_ids, knowledge_view_ids } = state.sync.specialised_object_ids_pending_save
    const wcomponents = object_type === "wcomponent"
    let ids = wcomponents ? wcomponent_ids : knowledge_view_ids

    ids = pending_save ? ensure_item_in_set(ids, id) : ensure_item_not_in_set(ids, id)
    const key = wcomponents ? "wcomponent_ids" : "knowledge_view_ids"
    state = update_subsubstate(state, "sync", "specialised_object_ids_pending_save", key, ids)

    return state
}
