import type { Store } from "redux"

import type { SpecialisedObjectsFromToServer } from "../../../wcomponent/interfaces/SpecialisedObjects"
import { ACTIONS } from "../../actions"
import { parse_specialised_objects_from_server_data } from "../../specialised_objects/parse_server_data"
import type { RootState } from "../../State"
import { error_to_string, SyncError } from "./errors"
import { supabase_load_data } from "../supabase/supabase_load_data"
import type { StorageType } from "../state"
import { ensure_any_knowledge_view_displayed } from "../../routing/utils/ensure_any_knowledge_view_displayed"



export function load_state (store: Store<RootState>)
{
    let state = store.getState()
    const { dispatch } = store

    store.dispatch(ACTIONS.specialised_object.clear_from_mem_all_specialised_objects())


    const { storage_type } = state.sync
    if (!storage_type)
    {
        console .log("Returning early from load_state.  No storage_type set")
        return
    }


    const { chosen_base_id } = state.user_info
    if (chosen_base_id === undefined)
    {
        return
    }


    dispatch(ACTIONS.sync.update_sync_status({ status: "LOADING", data_type: "specialised_objects" }))

    get_state_data(storage_type, chosen_base_id)
    .then(specialised_objects =>
    {
        dispatch(ACTIONS.specialised_object.replace_all_specialised_objects({ specialised_objects }))

        ensure_any_knowledge_view_displayed(store)

        dispatch(ACTIONS.sync.update_sync_status({ status: "LOADED", data_type: "specialised_objects" }))
    })
    .catch((error: SyncError | Error) =>
    {
        const error_message = error_to_string(error)
        console.error(error)
        dispatch(ACTIONS.sync.update_sync_status({ status: "FAILED", data_type: "specialised_objects", error_message }))
    })
}



export function get_state_data (storage_type: StorageType, chosen_base_id: number)
{
    let promise_data: Promise<SpecialisedObjectsFromToServer | null>


    // if (storage_type === "local_server")
    // {
    //     promise_data = fetch("http://localhost:4000/api/v1/specialised_state/", { method: "get" })
    //     .then(resp =>
    //     {
    //         if (resp.ok) return resp.json()

    //         return resp.text().then(text => Promise.reject(text))
    //     })
    //     .catch(err =>
    //     {
    //         if (err && err.message === "Failed to fetch") err = "local server not running or connection problem"

    //         const error: SyncError = { type: "general", message: "Error from server: " + err }
    //         return Promise.reject(error)
    //     })
    // }
    if (storage_type === "supabase")
    {
        promise_data = supabase_load_data(chosen_base_id)
    }
    else
    {
        const message = `storage_type "${storage_type}" unsupported`
        console.error(`Returning from get_state_data. ` + message)
        const error: SyncError = { type: "general", message }
        return Promise.reject(error)
    }

    return promise_data.then(data => parse_specialised_objects_from_server_data(data))
}
