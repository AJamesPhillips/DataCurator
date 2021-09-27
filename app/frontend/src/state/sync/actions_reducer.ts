import type { Action, AnyAction } from "redux"
import { ensure_item_in_set, ensure_item_not_in_set } from "../../utils/set"

import { update_substate, update_subsubstate } from "../../utils/update_state"
import type { RootState } from "../State"
import type { SyncDataType, SyncStateForDataType, SYNC_STATUS } from "./state"



export const sync_reducer = (state: RootState, action: AnyAction): RootState =>
{

    if (is_update_sync_status(action))
    {
        const { status, error_message = "", attempt: retry_attempt } = action

        const sync_state_for_data_type: SyncStateForDataType =
        {
            ...state.sync[action.data_type],
            status,
            error_message,
            retry_attempt,
        }

        state = update_substate(state, "sync", action.data_type, sync_state_for_data_type)
        state = update_ready_for_fields(state)
    }


    if (is_update_specialised_object_sync_info(action))
    {
        const { wcomponent_ids, knowledge_view_ids } = state.sync.specialised_object_ids_pending_save
        const wcomponents = action.object_type === "wcomponent"
        let ids = wcomponents ? wcomponent_ids : knowledge_view_ids

        ids = ensure_item_not_in_set(ids, action.id)
        const key = wcomponents ? "wcomponent_ids" : "knowledge_view_ids"
        state = update_subsubstate(state, "sync", "specialised_object_ids_pending_save", key, ids)
    }


    return state
}



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



interface UpdateSyncStatusArgs
{
    status: SYNC_STATUS
    data_type: SyncDataType
    error_message?: string
    attempt?: number
}

interface ActionUpdateSyncStatus extends Action, UpdateSyncStatusArgs {}

const update_sync_status_type = "update_sync_status"

export const update_sync_status = (args: UpdateSyncStatusArgs): ActionUpdateSyncStatus =>
{
    return { type: update_sync_status_type, ...args }
}

const is_update_sync_status = (action: AnyAction): action is ActionUpdateSyncStatus => {
    return action.type === update_sync_status_type
}



type SPECIALISED_OBJECT_TYPE = "knowledge_view" | "wcomponent"
interface UpdateSpecialisedObjectSyncInfoArgs
{
    id: string
    object_type: SPECIALISED_OBJECT_TYPE
    // needs_save: boolean -- Updated to false/true through upsert_wcomponent or upsert_knowledge_view
    //                        and setting `source_of_truth` to true/false
    saving: boolean
}

interface ActionUpdateSpecialisedObjectSyncInfo extends Action, UpdateSpecialisedObjectSyncInfoArgs {}

const update_specialised_object_sync_info_type = "update_specialised_object_sync_info"

export const update_specialised_object_sync_info = (args: UpdateSpecialisedObjectSyncInfoArgs): ActionUpdateSpecialisedObjectSyncInfo =>
{
    return { type: update_specialised_object_sync_info_type, ...args }
}

export const is_update_specialised_object_sync_info = (action: AnyAction): action is ActionUpdateSpecialisedObjectSyncInfo => {
    return action.type === update_specialised_object_sync_info_type
}



export const sync_actions = {
    update_sync_status,
    update_specialised_object_sync_info,
}



function update_ready_for_fields (state: RootState): RootState
{
    const { bases, specialised_objects } = state.sync

    // const bases_ready = get_ready_for_fields_for_data_type(bases)
    const specialised_objects_ready = get_ready_for_fields_for_data_type(specialised_objects)
    state = update_substate(state, "sync", "ready_for_reading", specialised_objects_ready.ready_for_reading)
    state = update_substate(state, "sync", "ready_for_writing", specialised_objects_ready.ready_for_writing)

    return state
}


function get_ready_for_fields_for_data_type (state: SyncStateForDataType)
{
    const { status } = state

    const saved = status === "SAVED"
    const loaded = status === "LOADED"
    const failed = status === "FAILED"

    const ready_for_reading = status !== undefined && status !== "LOADING"
    const ready_for_writing = saved || loaded || failed

    return { ready_for_reading, ready_for_writing }
}
