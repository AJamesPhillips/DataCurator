import type { Base } from "../../../shared/interfaces/base"
import { get_supabase } from "../../../supabase/get_supabase"
import { ACTIONS } from "../../actions"
import { get_knowledge_view_from_state, get_wcomponent_from_state } from "../../specialised_objects/accessors"
import type { StoreType } from "../../store"
import type { SPECIALISED_OBJECT_TYPE } from "../actions"
import { merge_knowledge_view } from "../merge/merge_knowledge_views"
import { merge_wcomponent } from "../merge/merge_wcomponents"
import {
    get_last_source_of_truth_knowledge_view_from_state,
    get_last_source_of_truth_wcomponent_from_state,
} from "../selector"
import type { UpsertItemReturn } from "../supabase/interface"
import { supabase_upsert_knowledge_view } from "../supabase/knowledge_view"
import { supabase_upsert_wcomponent } from "../supabase/wcomponent"
import { error_to_string } from "./errors"
import { get_next_specialised_state_id_to_save } from "./needs_save"



let global_attempts = 0
export async function save_state (store: StoreType, is_manual_save = false)
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

        store.dispatch(ACTIONS.sync.update_sync_status({ status: "SAVED", data_type: "specialised_objects" }))

        if (is_manual_save)
        {
            console .log(`No ids need to be saved: "${wc_ids}", "${kv_ids}"`)
            return Promise.resolve()
        }
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


    try
    {
        global_attempts += 1
        const successfully_finished_upsert = await promise_response

        if (successfully_finished_upsert) global_attempts = 0 // reset

        if (global_attempts < 10)
        {
            store.dispatch(ACTIONS.sync.update_sync_status({ status: "SAVED", data_type: "specialised_objects" }))
        }
        else
        {
            // This will protect against a code error resulting in an infinite cycle of 409
            store.dispatch(ACTIONS.sync.update_sync_status({
                status: "FAILED", data_type: "specialised_objects", error_message: `Try manually saving or refresh the page.  Failing that contact the team.`, attempt: global_attempts,
            }))
        }
    }
    catch (err)
    {
        console.error(`Got error saving ${next_id_to_save.object_type} ${next_id_to_save.id}.  Error: ${err}`)
        store.dispatch(ACTIONS.sync.update_sync_status({
            status: "FAILED", data_type: "specialised_objects", error_message: `${err}`, attempt: global_attempts,
        }))
    }

    return Promise.resolve()
}



async function save_knowledge_view (id: string, store: StoreType)
{
    const object_type: SPECIALISED_OBJECT_TYPE = "knowledge_view"
    const maybe_initial_item = get_knowledge_view_from_state(store.getState(), id)

    const pre_upsert_check_result = pre_upsert_check(id, store, object_type, maybe_initial_item)
    if (pre_upsert_check_result.error) return pre_upsert_check_result.error
    const initial_item = pre_upsert_check_result.initial_item


    const supabase = get_supabase()
    const response = await supabase_upsert_knowledge_view({ supabase, knowledge_view: initial_item })

    const post_upsert_check_result = post_upsert_check(id, store, object_type, response)
    if (post_upsert_check_result.error) return post_upsert_check_result.error
    const { create_successful, update_successful, latest_source_of_truth } = post_upsert_check_result


    const last_source_of_truth = get_last_source_of_truth_knowledge_view_from_state(store.getState(), id)
    const current_value = get_knowledge_view_from_state(store.getState(), id)
    store.dispatch(ACTIONS.specialised_object.upsert_knowledge_view({
        knowledge_view: latest_source_of_truth, source_of_truth: true,
    }))


    const check_merge_args_result = check_merge_args({
        object_type,
        initial_item,
        last_source_of_truth,
        current_value,
    })
    if (check_merge_args_result.error) return check_merge_args_result.error
    if (check_merge_args_result.merge_args)
    {
        const merge = merge_knowledge_view({
            ...check_merge_args_result.merge_args,
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

    return Promise.resolve(create_successful || update_successful)
}



async function save_wcomponent (id: string, store: StoreType)
{
    const object_type: SPECIALISED_OBJECT_TYPE = "wcomponent"
    const maybe_initial_item = get_wcomponent_from_state(store.getState(), id)

    const pre_upsert_check_result = pre_upsert_check(id, store, object_type, maybe_initial_item)
    if (pre_upsert_check_result.error) return pre_upsert_check_result.error
    const initial_item = pre_upsert_check_result.initial_item


    const supabase = get_supabase()
    const response = await supabase_upsert_wcomponent({ supabase, wcomponent: initial_item })

    const post_upsert_check_result = post_upsert_check(id, store, object_type, response)
    if (post_upsert_check_result.error) return post_upsert_check_result.error
    const { create_successful, update_successful, latest_source_of_truth } = post_upsert_check_result


    const last_source_of_truth = get_last_source_of_truth_wcomponent_from_state(store.getState(), id)
    const current_value = get_wcomponent_from_state(store.getState(), id)
    store.dispatch(ACTIONS.specialised_object.upsert_wcomponent({
        wcomponent: latest_source_of_truth, source_of_truth: true,
    }))


    const check_merge_args_result = check_merge_args({
        object_type,
        initial_item,
        last_source_of_truth,
        current_value,
    })
    if (check_merge_args_result.error) return check_merge_args_result.error
    if (check_merge_args_result.merge_args)
    {
        const merge = merge_wcomponent({
            ...check_merge_args_result.merge_args,
            source_of_truth: latest_source_of_truth,
            update_successful,
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

        if (merge.unresolvable_conflicted_fields.length)
        {
            // TODO add unresolvable conflict
        }
    }

    return Promise.resolve(create_successful || update_successful)
}



function pre_upsert_check <U extends Base> (id: string, store: StoreType, object_type: SPECIALISED_OBJECT_TYPE, initial_item: U | undefined)
{
    if (!initial_item)
    {
        store.dispatch(ACTIONS.sync.debug_refresh_all_specialised_object_ids_pending_save())
        const error = Promise.reject(`Inconsistent state violation.  save_"${object_type}" but no item for id: "${id}".  Updating all specialised_object_ids_pending_save.`)
        return { error, initial_item: undefined }
    }

    store.dispatch(ACTIONS.sync.update_specialised_object_sync_info({
        id: initial_item.id, object_type, saving: true,
    }))

    return { error: undefined, initial_item }
}



function post_upsert_check <U extends Base> (id: string, store: StoreType, object_type: SPECIALISED_OBJECT_TYPE, response: UpsertItemReturn<U>)
{
    const create_successful = response.status === 201
    const update_successful = response.status === 200
    if (!create_successful && !update_successful && response.status !== 409)
    {
        const error_string = error_to_string(response.error)
        const error = Promise.reject(`save_"${object_type}" got "${response.status}" error: "${error_string}"`)

        return { error, create_successful, update_successful, latest_source_of_truth: undefined }
    }


    const latest_source_of_truth = response.item
    if (!latest_source_of_truth)
    {
        const error = Promise.reject(`Inconsistent state violation.  save_"${object_type}" got "${response.status}" but no latest_source_of_truth item.  Error: "${response.error}".`)

        return { error, create_successful, update_successful, latest_source_of_truth }
    }

    return { error: undefined, create_successful, update_successful, latest_source_of_truth }
}



interface CheckMergeArgsArgs<U>
{
    object_type: SPECIALISED_OBJECT_TYPE
    initial_item: U
    last_source_of_truth: U | undefined
    current_value: U | undefined
}

interface CheckMergeArgsReturn <U>
{
    error: Promise<string> | undefined
    merge_args: undefined | {
        last_source_of_truth: U
        current_value: U
    }
}
function check_merge_args <U extends Base> (args: CheckMergeArgsArgs<U>): CheckMergeArgsReturn<U>
{
    const { object_type, initial_item, last_source_of_truth, current_value } = args

    if (!last_source_of_truth)
    {
        if (initial_item.modified_at)
        {
            const error = Promise.reject(`Inconsistent state violation.  save_"${object_type}" found no last_source_of_truth "${object_type}" for id: "${initial_item.id}" but "${object_type}" had a modified_at already set`)
            return { error, merge_args: undefined }
        }
        else
        {
            // "${object_type}" has been created.  status code should be 201
        }
    }
    else
    {
        if (!current_value)
        {
            const error = Promise.reject(`Inconsistent state violation.  save_"${object_type}" found "${object_type}" last_source_of_truth but no current_value for id "${initial_item.id}".`)
            return { error, merge_args: undefined }
        }

        return { error: undefined, merge_args: { last_source_of_truth, current_value } }
    }

    return { error: undefined, merge_args: undefined }
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