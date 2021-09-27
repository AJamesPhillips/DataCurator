import type { Dispatch } from "redux"

import type { SpecialisedObjectsFromToServer } from "../../../shared/wcomponent/interfaces/SpecialisedObjects"
import { ACTIONS } from "../../actions"
import type { RootState } from "../../State"
import type { UserInfoState } from "../../user_info/state"
import type { StorageType } from "../state"
import { error_to_string, SyncError } from "./errors"
import { get_next_specialised_state_id_to_save } from "./needs_save"
import { save_supabase_data } from "../supabase/supabase_save_data"
import { get_wcomponent_from_state } from "../../specialised_objects/accessors"



export function save_state (dispatch: Dispatch, state: RootState)
{
    if (!state.sync.ready_for_writing)
    {
        console.error(`State machine violation.  Save state called whilst state.sync.status: "${state.sync.specialised_objects.status}", ready_for_writing: ${state.sync.ready_for_writing}`)
        return Promise.reject()
    }


    const next_id_to_save = get_next_specialised_state_id_to_save(state)
    if (!next_id_to_save)
    {
        const { wcomponent_ids, knowledge_view_ids } = state.sync.specialised_object_ids_pending_save
        const wc_ids = JSON.stringify(Array.from(wcomponent_ids))
        const kv_ids = JSON.stringify(Array.from(knowledge_view_ids))

        console.error(`State machine violation.  No ids need to be saved: "${wc_ids}", "${kv_ids}"`)
        return Promise.reject()
    }

    dispatch(ACTIONS.sync.update_sync_status({ status: "SAVING", data_type: "specialised_objects" }))

    if (next_id_to_save.object_type === "wcomponent")
    {
        return save_wcomponent(next_id_to_save.id, dispatch, state)
    }
    else
    {
        return save_knowledge_view(next_id_to_save.id)
    }

    // return retryable_save({ storage_type, data, user_info: state.user_info, dispatch })
    // .then(() =>
    // {
    //     // Move this here so that retryable_save can be used by swap_storage and not trigger front end
    //     // code to prematurely think that application is ready
    //     dispatch(ACTIONS.sync.update_sync_status({ status: "SAVED", data_type: "specialised_objects" }))
    //     return state
    // })
}




function save_wcomponent (id: string, dispatch: Dispatch, state: RootState)
{
    const kv = get_wcomponent_from_state(state, id)
    if (!kv)
    {
        console.error(`save_wcomponent but no wcomponent for id: "${id}"`)
        dispatch(ACTIONS.sync.mark_specialised_object_id_as_saved({ id, object_type: "wcomponent" }))
        return
    }
    // work in progress

    // dispatch(ACTIONS.sync.)
}

function save_knowledge_view (id: string)
{

}


/*
const MAX_ATTEMPTS = 5
interface AttemptSaveArgs
{
    storage_type: StorageType
    data: SpecialisedObjectsFromToServer
    user_info: UserInfoState
    dispatch: Dispatch
    max_attempts?: number
    attempt?: number
}
export function retryable_save (args: AttemptSaveArgs)
{
    const {
        storage_type,
        data,
        user_info,
        dispatch,
        max_attempts = MAX_ATTEMPTS,
    } = args
    let { attempt = 0 } = args

    attempt += 1

    console .log(`retryable_save to "${storage_type}" with data.knowledge_views: ${data.knowledge_views.length}, data.wcomponents: ${data.wcomponents.length}, attempt: ${attempt}`)


    let promise_save_data: Promise<any>

    // if (storage_type === "local_server")
    // {
    //     // const state_to_save = get_state_to_save(state)
    //     // const state_str = JSON.stringify(state_to_save)

    //     // fetch("http://localhost:4000/api/v1/state/", {
    //     //     method: "post",
    //     //     body: state_str,
    //     // })

    //     const specialised_state_str = JSON.stringify(data)
    //     promise_save_data = fetch("http://localhost:4000/api/v1/specialised_state/", {
    //         method: "post",
    //         body: specialised_state_str,
    //     })
    //     .then((res) =>
    //     {
    //         if (res.ok) return ""

    //         return res.text()
    //         .then(text =>
    //         {
    //             const error: SyncError = { type: "general", message: text }
    //             return Promise.reject(error)
    //         })
    //     })
    // }
    if (storage_type === "supabase")
    {
        promise_save_data = save_supabase_data(user_info, data)
    }
    else
    {
        console.error(`Returning from save_state.  storage_type "${storage_type}" unsupported.`)
        return Promise.reject()
    }


    return promise_save_data
    .catch((error: SyncError | Error) =>
    {
        let error_message = error_to_string(error)

        if (attempt >= max_attempts)
        {
            error_message = `Stopping after ${attempt} attempts at resaving: ${error_message}`
            console.error(error_message)

            const action = ACTIONS.sync.update_sync_status({ status: "FAILED", data_type: "specialised_objects", error_message, attempt: 0 })
            dispatch(action)

            return Promise.reject()
        }
        else
        {
            error_message = `Retrying attempt ${attempt}; ${error_message}`
            console.error(error_message)

            const action = ACTIONS.sync.update_sync_status({ status: "FAILED", data_type: "specialised_objects", error_message, attempt })
            dispatch(action)

            return new Promise((resolve, reject) =>
            {
                setTimeout(() =>
                {
                    console .log(`retrying save to ${storage_type}, attempt ${attempt}`)
                    // const potentially_newer_state = get_store().getState().user_info
                    retryable_save({ storage_type, data, user_info, dispatch, max_attempts, attempt })
                    .then(resolve).catch(reject)
                }, 1000)
            })
        }
    })
}
*/