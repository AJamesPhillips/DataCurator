import { ACTIONS } from "../../actions"
import { parse_specialised_objects_from_server_data } from "../../specialised_objects/parse_server_data"
import { error_to_string, SyncError } from "./errors"
import { supabase_load_data } from "../supabase/supabase_load_data"
import { ensure_any_knowledge_view_displayed } from "../../routing/utils/ensure_any_knowledge_view_displayed"
import type { StoreType } from "../../store"
import { ensure_a_knowledge_view_is_in_existence } from "../../specialised_objects/ensure_a_knowledge_view_is_in_existence"



export function load_state (store: StoreType)
{
    let state = store.getState()
    const { dispatch } = store

    const { chosen_base_id } = state.user_info

    if (chosen_base_id === state.sync.specialised_objects.loading_base_id)
    {
        return
    }

    store.dispatch(ACTIONS.specialised_object.clear_from_mem_all_specialised_objects())


    if (chosen_base_id === undefined)
    {
        return
    }


    dispatch(ACTIONS.sync.update_sync_status({
        status: "LOADING",
        data_type: "specialised_objects",
        loading_base_id: chosen_base_id,
    }))

    supabase_load_data(store.load_state_from_storage, chosen_base_id)
    .then(data => parse_specialised_objects_from_server_data(data))
    .then(specialised_objects =>
    {
        dispatch(ACTIONS.specialised_object.replace_all_specialised_objects({ specialised_objects }))

        dispatch(ACTIONS.sync.update_sync_status({ status: "LOADED", data_type: "specialised_objects" }))

        ensure_a_knowledge_view_is_in_existence(store)
        ensure_any_knowledge_view_displayed(store)
    })
    .catch((error: SyncError | Error) =>
    {
        const error_message = error_to_string(error)
        console.error(error)
        dispatch(ACTIONS.sync.update_sync_status({ status: "FAILED", data_type: "specialised_objects", error_message }))
    })
}
