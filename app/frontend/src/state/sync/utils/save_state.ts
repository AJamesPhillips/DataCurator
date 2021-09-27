
import { ACTIONS } from "../../actions"
import { get_next_specialised_state_id_to_save } from "./needs_save"
import { get_knowledge_view_from_state, get_wcomponent_from_state } from "../../specialised_objects/accessors"
import { get_supabase } from "../../../supabase/get_supabase"
import { supabase_upsert_wcomponent } from "../supabase/wcomponent"
import { merge_wcomponent } from "../merge/merge_wcomponents"
import type { StoreType } from "../../store"
import {
    get_last_source_of_truth_knowledge_view_from_state,
    get_last_source_of_truth_wcomponent_from_state,
} from "../selector"
import { supabase_upsert_knowledge_view } from "../supabase/knowledge_view"
import { merge_knowledge_view } from "../merge/merge_knowledge_views"



export async function save_state (store: StoreType)
{
    const state = store.getState()

    if (!state.sync.ready_for_writing)
    {
        console.error(`Inconsistent state violation.  Save state called whilst state.sync.status: "${state.sync.specialised_objects.status}", ready_for_writing: ${state.sync.ready_for_writing}`)
        return Promise.reject()
    }


    const next_id_to_save = get_next_specialised_state_id_to_save(state)
    if (!next_id_to_save)
    {
        const { wcomponent_ids, knowledge_view_ids } = state.sync.specialised_object_ids_pending_save
        const wc_ids = JSON.stringify(Array.from(wcomponent_ids))
        const kv_ids = JSON.stringify(Array.from(knowledge_view_ids))

        console.error(`Inconsistent state violation.  No ids need to be saved: "${wc_ids}", "${kv_ids}"`)
        return Promise.reject()
    }

    store.dispatch(ACTIONS.sync.update_sync_status({ status: "SAVING", data_type: "specialised_objects" }))

    let promise_response

    if (next_id_to_save.object_type === "knowledge_view")
    {
        promise_response = save_knowledge_view(next_id_to_save.id, store)
    }
    else
    {
        promise_response = save_wcomponent(next_id_to_save.id, store)
    }


    let success = true
    try
    {
        await promise_response
        store.dispatch(ACTIONS.sync.update_sync_status({ status: "SAVED", data_type: "specialised_objects" }))
    }
    catch (err)
    {
        console.error(`Got error saving ${next_id_to_save.object_type} ${next_id_to_save.id}.  Error: ${err}`)
        store.dispatch(ACTIONS.sync.update_sync_status({
            status: "FAILED", data_type: "specialised_objects", error_message: `${err}`,
        }))

        success = false
    }

    return Promise.resolve(success)

    // return retryable_save({ storage_type, data, user_info: state.user_info, dispatch })
    // .then(() =>
    // {
    //     // Move this here so that retryable_save can be used by swap_storage and not trigger front end
    //     // code to prematurely think that application is ready
    //     dispatch(ACTIONS.sync.update_sync_status({ status: "SAVED", data_type: "specialised_objects" }))
    //     return state
    // })
}




async function save_wcomponent (id: string, store: StoreType)
{
    const wcomponent = get_wcomponent_from_state(store.getState(), id)
    if (!wcomponent)
    {
        store.dispatch(ACTIONS.sync.debug_refresh_all_specialised_object_ids_pending_save())
        return Promise.reject(`Inconsistent state violation.  save_wcomponent but no wcomponent for id: "${id}".  Updating all specialised_object_ids_pending_save.`)
    }

    store.dispatch(ACTIONS.sync.update_specialised_object_sync_info({
        id: wcomponent.id, object_type: "wcomponent", saving: true,
    }))

    const supabase = get_supabase()
    const res = await supabase_upsert_wcomponent({ supabase, wcomponent })
    if (res.status !== 200 && res.status !== 409)
    {
        return Promise.reject(`save_wcomponent got "${res.status}" error: "${res.error}"`)
    }

    let latest_source_of_truth = res.item
    if (!latest_source_of_truth)
    {
        return Promise.reject(`Inconsistent state violation.  save_wcomponent got "${res.status}" but no latest_source_of_truth item.  Error: "${res.error}".`)
    }


    const last_source_of_truth = get_last_source_of_truth_wcomponent_from_state(store.getState(), id)
    store.dispatch(ACTIONS.specialised_object.upsert_wcomponent({
        wcomponent: latest_source_of_truth, source_of_truth: true,
    }))


    if (!last_source_of_truth)
    {
        if (wcomponent.modified_at)
        {
            return Promise.reject(`Inconsistent state violation.  save_wcomponent found no last_source_of_truth wcomponent for id: "${id}" but wcomponent had a modified_at already set`)
        }
    }
    else
    {
        const current_value = get_wcomponent_from_state(store.getState(), id)
        if (!current_value) return Promise.reject(`Inconsistent state violation.  save_wcomponent found wcomponent last_source_of_truth but no current_value for id "${id}".`)

        const merge = merge_wcomponent({
            last_source_of_truth,
            current_value,
            source_of_truth: latest_source_of_truth,
            update_successful: res.status === 200,
        })

        if (merge.needs_save)
        {
            store.dispatch(ACTIONS.specialised_object.upsert_wcomponent({
                wcomponent: {
                    ...merge.value,
                    // needs_save: true, -- No need to set here as this will be set in reducer due to `source_of_truth: false`
                },
                source_of_truth: false,
            }))
        }

        if (merge.unresolvable_conflicted_fields)
        {
            // TODO add unresolvable conflict
        }
    }

    return Promise.resolve()
}



async function save_knowledge_view (id: string, store: StoreType)
{
    const knowledge_view = get_knowledge_view_from_state(store.getState(), id)
    if (!knowledge_view)
    {
        store.dispatch(ACTIONS.sync.debug_refresh_all_specialised_object_ids_pending_save())
        return Promise.reject(`Inconsistent state violation.  save_knowledge_view but no knowledge_view for id: "${id}".  Updating all specialised_object_ids_pending_save.`)
    }

    store.dispatch(ACTIONS.sync.update_specialised_object_sync_info({
        id: knowledge_view.id, object_type: "knowledge_view", saving: true,
    }))

    const supabase = get_supabase()
    const res = await supabase_upsert_knowledge_view({ supabase, knowledge_view })


    const create_successful = res.status === 201
    const update_successful = res.status === 200
    if (!create_successful && !update_successful && res.status !== 409)
    {
        return Promise.reject(`save_knowledge_view got "${res.status}" error: "${res.error}"`)
    }

    let latest_source_of_truth = res.item
    if (!latest_source_of_truth)
    {
        return Promise.reject(`Inconsistent state violation.  save_knowledge_view got "${res.status}" but no latest_source_of_truth item.  Error: "${res.error}".`)
    }


    const last_source_of_truth = get_last_source_of_truth_knowledge_view_from_state(store.getState(), id)
    const current_value = get_knowledge_view_from_state(store.getState(), id)
    store.dispatch(ACTIONS.specialised_object.upsert_knowledge_view({
        knowledge_view: latest_source_of_truth, source_of_truth: true,
    }))


    if (!last_source_of_truth)
    {
        if (knowledge_view.modified_at)
        {
            return Promise.reject(`Inconsistent state violation.  save_knowledge_view found no last_source_of_truth knowledge_view for id: "${id}" but knowledge_view had a modified_at already set`)
        }
        else
        {
            // knowledge_view has been created.  status code should be 201
        }
    }
    else
    {
        if (!current_value) return Promise.reject(`Inconsistent state violation.  save_knowledge_view found knowledge_view last_source_of_truth but no current_value for id "${id}".`)

        const merge = merge_knowledge_view({
            last_source_of_truth,
            current_value,
            source_of_truth: latest_source_of_truth,
            update_successful,
        })

        if (merge.needs_save)
        {
            store.dispatch(ACTIONS.specialised_object.upsert_knowledge_view({
                knowledge_view: {
                    ...merge.value,
                    // needs_save: true, -- No need to set here as this will be set in reducer due to `source_of_truth: false`
                },
                source_of_truth: false,
            }))
        }

        if (merge.unresolvable_conflicted_fields.length)
        {
            // TODO add unresolvable conflict
        }
    }

    return (create_successful || update_successful) ? Promise.resolve() : Promise.reject("Conflicting edits")
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