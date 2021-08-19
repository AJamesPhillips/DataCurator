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
import { get_specialised_state_to_save, needs_save } from "./needs_save"
import { save_solid_data } from "./solid_save_data"



let last_attempted_state_to_save: RootState | undefined = undefined
export function conditionally_save_state (load_state_from_storage: boolean, dispatch: Dispatch, state: RootState)
{
    if (!load_state_from_storage) return

    const { status, storage_type } = state.sync
    if (status !== "SAVED" && status !== "SAVING" && status !== "LOADED") return


    if (!needs_save(state, last_attempted_state_to_save)) return

    if (!storage_type)
    {
        const error_message = "Can not save.  No storage_type set"
        const action = ACTIONS.sync.update_sync_status({ status: "FAILED", error_message, attempt: 0 })
        dispatch(action)
        return
    }


    const next_call_at_ms = throttled_save_state.throttled({ dispatch, state })
    // Have to use conditional otherwise store.subscribe fires every time even when state does not change
    if (state.sync.next_save_ms !== next_call_at_ms)
    {
        dispatch(ACTIONS.sync.set_next_sync_ms({ next_save_ms: next_call_at_ms }))
    }
}



let ctrl_s_flush_saving = false
export function conditional_ctrl_s_save (load_state_from_storage: boolean, dispatch: Dispatch, state: RootState)
{
    if (!load_state_from_storage) return

    const ctrl_s_flush_save = is_ctrl_s_flush_save(state)
    if (ctrl_s_flush_save && !ctrl_s_flush_saving)
    {
        ctrl_s_flush_saving = true
        throttled_save_state.throttled({ dispatch, state })
        throttled_save_state.flush()
        dispatch(ACTIONS.sync.set_next_sync_ms({ next_save_ms: undefined }))
        ctrl_s_flush_saving = false
    }
}



const SAVE_THROTTLE_MS = 60000
export const throttled_save_state = min_throttle(save_state, SAVE_THROTTLE_MS)



interface SaveStateArgs
{
    dispatch: Dispatch
    state: RootState
}
function save_state ({ dispatch, state }: SaveStateArgs)
{
    last_attempted_state_to_save = state
    dispatch(ACTIONS.sync.update_sync_status({ status: "SAVING" }))

    const storage_type = state.sync.storage_type!
    const data = get_specialised_state_to_save(state)

    return attempt_save({ storage_type, data, user_info: state.user_info, dispatch })
    .then(() =>
    {
        // Move this here so that attempt_save can be used by swap_storage and not trigger front end
        // code to prematurely think that application is ready
        dispatch(ACTIONS.sync.update_sync_status({ status: "SAVED" }))
    })
    .catch(() => last_attempted_state_to_save = undefined)
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
export function attempt_save (args: AttemptSaveArgs)
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
    console .log(`attempt_save${is_backup_str} to "${storage_type}" with data.wcomponents: ${data.wcomponents.length}, attempt: ${attempt}`)


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
                    attempt_save({ storage_type, data, user_info, dispatch, max_attempts, attempt, is_backup })
                    .then(resolve).catch(reject)
                }, 1000)
            })
        }
    })
}



function is_ctrl_s_flush_save (state: RootState)
{
    // Ctrl+s to save
    return state.global_keys.keys_down.has("s") && state.global_keys.keys_down.has("Control")
}


// function get_state_to_save (state: RootState)
// {
//     const state_to_save = {
//         statements: state.statements,
//         patterns: state.patterns,
//         objects: state.objects.map(convert_object_to_core),
//     }

//     return state_to_save
// }


// function convert_object_to_core (object: ObjectWithCache): CoreObject
// {
//     return {
//         id: object.id,
//         datetime_created: object.datetime_created,
//         labels: object.labels,
//         attributes: object.attributes.map(convert_attribute_to_core),
//         pattern_id: object.pattern_id,
//         external_ids: object.external_ids,
//     }
// }

// function convert_attribute_to_core (attribute: ObjectAttribute): CoreObjectAttribute
// {
//     if (is_id_attribute(attribute))
//     {
//         return {
//             pidx: attribute.pidx,
//             id: attribute.id,
//         }
//     }

//     return {
//         pidx: attribute.pidx,
//         value: attribute.value,
//     }
// }
