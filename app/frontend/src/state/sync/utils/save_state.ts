import { getDefaultSession } from "@inrupt/solid-client-authn-browser"
import { setItem } from "localforage"
import type { Dispatch } from "redux"

import { LOCAL_STORAGE_STATE_KEY } from "../../../constants"
import type { SpecialisedObjectsFromToServer } from "../../../shared/wcomponent/interfaces/SpecialisedObjects"
import { min_throttle } from "../../../utils/throttle"
import { ACTIONS } from "../../actions"
import type { RootState } from "../../State"
import type { UserInfoState } from "../../user_info/state"
import type { StorageType } from "../state"
import { error_to_string, SyncError } from "./errors"
import { get_specialised_state_to_save } from "./needs_save"
import { save_solid_data } from "./solid_save_data"



export function storage_dependent_save (dispatch: Dispatch, state: RootState)
{
    const { storage_type } = state.sync

    if (storage_type !== "solid")
    {
        // If not saving to solid then save immediately and do not throttle
        throttled_save_state.throttled({ dispatch, state })
        throttled_save_state.flush()
    }
    else
    {
        const solid_session = getDefaultSession()
        if (!solid_session.info.isLoggedIn)
        {
            throttled_save_state.cancel()

            const error_message = "Can not save.  Not logged in"
            dispatch(ACTIONS.sync.update_sync_status({ status: "FAILED", error_message, attempt: 0 }))

            if (state.sync.next_save_ms !== undefined)
            {
                dispatch(ACTIONS.sync.set_next_sync_ms({ next_save_ms: undefined }))
            }
        }
        else
        {
            const next_call_at_ms = throttled_save_state.throttled({ dispatch, state })
            // Have to use conditional otherwise store.subscribe fires every time
            // `set_next_sync_ms` is called even when `next_save_ms` does not change
            if (state.sync.next_save_ms !== next_call_at_ms)
            {
                dispatch(ACTIONS.sync.set_next_sync_ms({ next_save_ms: next_call_at_ms }))
            }
        }

    }


    return throttled_save_state
}



const SAVE_THROTTLE_MS = 60000
export const throttled_save_state = min_throttle(save_state, SAVE_THROTTLE_MS)
export const last_attempted_state_to_save: { state: RootState | undefined } = { state: undefined }



interface SaveStateArgs
{
    dispatch: Dispatch
    state: RootState
}
function save_state ({ dispatch, state }: SaveStateArgs): Promise<RootState | undefined>
{
    last_attempted_state_to_save.state = state
    dispatch(ACTIONS.sync.update_sync_status({ status: "SAVING" }))
    dispatch(ACTIONS.sync.set_next_sync_ms({ next_save_ms: undefined }))

    const storage_type = state.sync.storage_type!
    const data = get_specialised_state_to_save(state)

    return retryable_save({ storage_type, data, user_info: state.user_info, dispatch })
    .then(() =>
    {
        // Move this here so that retryable_save can be used by swap_storage and not trigger front end
        // code to prematurely think that application is ready
        dispatch(ACTIONS.sync.update_sync_status({ status: "SAVED" }))
        return state
    })
    .catch(() => last_attempted_state_to_save.state = undefined)
}



const MAX_ATTEMPTS = 5
interface AttemptSaveArgs
{
    storage_type: StorageType
    data: SpecialisedObjectsFromToServer
    user_info: UserInfoState
    dispatch: Dispatch
    max_attempts?: number
    attempt?: number
    is_backup?: boolean
}
export function retryable_save (args: AttemptSaveArgs)
{
    const {
        storage_type,
        data,
        user_info,
        dispatch,
        max_attempts = MAX_ATTEMPTS,
        is_backup,
    } = args
    let { attempt = 0 } = args

    attempt += 1

    const is_backup_str = is_backup ? " (backup)" : ""
    console .log(`retryable_save${is_backup_str} to "${storage_type}" with data.knowledge_views: ${data.knowledge_views.length}, data.wcomponents: ${data.wcomponents.length}, attempt: ${attempt}`)


    let promise_save_data: Promise<any>

    if (storage_type === "local_server")
    {
        // const state_to_save = get_state_to_save(state)
        // const state_str = JSON.stringify(state_to_save)

        // fetch("http://localhost:4000/api/v1/state/", {
        //     method: "post",
        //     body: state_str,
        // })

        const specialised_state_str = JSON.stringify(data)
        promise_save_data = fetch("http://localhost:4000/api/v1/specialised_state/", {
            method: "post",
            body: specialised_state_str,
        })
    }
    else if (storage_type === "solid")
    {
        promise_save_data = save_solid_data(user_info, data)
    }
    else if (storage_type === "local_storage")
    {
        promise_save_data = setItem(LOCAL_STORAGE_STATE_KEY, data)
    }
    else
    {
        console.error(`Returning from save_state${is_backup_str}.  storage_type "${storage_type}" unsupported.`)
        return Promise.reject()
    }


    return promise_save_data
    .catch((error: SyncError | Error) =>
    {
        let error_message = error_to_string(error)

        if (attempt >= max_attempts)
        {
            error_message = `Stopping after ${attempt} attempts at resaving${is_backup_str}: ${error_message}`
            console.error(error_message)

            const action = is_backup
                ? ACTIONS.backup.update_backup_status({ status: "FAILED" })
                : ACTIONS.sync.update_sync_status({ status: "FAILED", error_message, attempt: 0 })
            dispatch(action)

            return Promise.reject()
        }
        else
        {
            error_message = `Retrying${is_backup_str} attempt ${attempt}; ${error_message}`
            console.error(error_message)

            const action = is_backup
                ? ACTIONS.backup.update_backup_status({ status: "FAILED" })
                : ACTIONS.sync.update_sync_status({
                    status: "FAILED",
                    error_message,
                    attempt,
                })
            dispatch(action)

            return new Promise((resolve, reject) =>
            {
                setTimeout(() =>
                {
                    console .log(`retrying save${is_backup_str} to ${storage_type}, attempt ${attempt}`)
                    // const potentially_newer_state = get_store().getState().user_info
                    retryable_save({ storage_type, data, user_info, dispatch, max_attempts, attempt, is_backup })
                    .then(resolve).catch(reject)
                }, 1000)
            })
        }
    })
}
