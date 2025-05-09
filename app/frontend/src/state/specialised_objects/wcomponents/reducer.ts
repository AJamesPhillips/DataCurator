import type { AnyAction } from "redux"

import { update_subsubstate } from "../../../utils/update_state"
import type { RootState } from "../../State"
import { is_update_specialised_object_sync_info } from "../../sync/actions"
import { get_wcomponent_from_state } from "../accessors"
import { is_add_wcomponents_to_store, is_delete_wcomponent, is_upsert_wcomponent } from "./actions"
import { bulk_editing_wcomponents_reducer } from "./bulk_edit/reducer"
import { tidy_wcomponent } from "./tidy_wcomponent"
import { handle_add_wcomponents_to_store, handle_upsert_wcomponent } from "./utils"



export const wcomponents_reducer = (state: RootState, action: AnyAction): RootState =>
{

    if (is_upsert_wcomponent(action))
    {
        const tidied = tidy_wcomponent(action.wcomponent, state.specialised_objects.wcomponents_by_id)
        state = handle_upsert_wcomponent(state, tidied, action.is_source_of_truth)
    }


    if (is_delete_wcomponent(action))
    {
        const { wcomponent_id } = action
        let { wcomponents_by_id } = state.specialised_objects
        const existing = wcomponents_by_id[wcomponent_id]


        if (existing)
        {
            state = handle_upsert_wcomponent(state, existing, false, true)
        }
    }


    if (is_add_wcomponents_to_store(action))
    {
        const tidied = action.wcomponents.map(wc => tidy_wcomponent(wc, state.specialised_objects.wcomponents_by_id))
        state = handle_add_wcomponents_to_store(state, tidied)
    }


    if (is_update_specialised_object_sync_info(action) && action.object_type === "wcomponent")
    {
        let wc = get_wcomponent_from_state(state, action.id)
        if (wc)
        {
            wc = { ...wc, saving: action.saving }
            state = update_subsubstate(state, "specialised_objects", "wcomponents_by_id", action.id, wc)
        }
        else
        {
            console.error(`Could not find wcomponent by id: "${action.id}" whilst handling is_update_specialised_object_sync_info`)
        }
    }


    state = bulk_editing_wcomponents_reducer(state, action)

    return state
}
