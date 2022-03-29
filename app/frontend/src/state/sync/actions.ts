import type { Action, AnyAction } from "redux"

import type { SyncDataType, SYNC_STATUS } from "./state"



interface UpdateSyncStatusArgs
{
    status: SYNC_STATUS
    data_type: SyncDataType
    error_message?: string
    attempt?: number
}

interface ActionUpdateSyncStatus extends Action, UpdateSyncStatusArgs {}

const update_sync_status_type = "update_sync_status"

const update_sync_status = (args: UpdateSyncStatusArgs): ActionUpdateSyncStatus =>
{
    return { type: update_sync_status_type, ...args }
}

export const is_update_sync_status = (action: AnyAction): action is ActionUpdateSyncStatus => {
    return action.type === update_sync_status_type
}



interface ActionDebugRefreshAllSpecialisedObjectIdsPendingSave extends Action {}

const debug_refresh_all_specialised_object_ids_pending_save_type = "debug_refresh_all_specialised_object_ids_pending_save"

const debug_refresh_all_specialised_object_ids_pending_save = (): ActionDebugRefreshAllSpecialisedObjectIdsPendingSave =>
{
    return { type: debug_refresh_all_specialised_object_ids_pending_save_type }
}

export const is_debug_refresh_all_specialised_object_ids_pending_save = (action: AnyAction): action is ActionDebugRefreshAllSpecialisedObjectIdsPendingSave => {
    return action.type === debug_refresh_all_specialised_object_ids_pending_save_type
}



export type SPECIALISED_OBJECT_TYPE = "knowledge_view" | "wcomponent"
interface UpdateSpecialisedObjectSyncInfoArgs
{
    id: string
    object_type: SPECIALISED_OBJECT_TYPE
    // needs_save: boolean -- Updated to false/true through upsert_wcomponent or upsert_knowledge_view
    //                        and setting `is_source_of_truth` to true/false
    saving: boolean
}

interface ActionUpdateSpecialisedObjectSyncInfo extends Action, UpdateSpecialisedObjectSyncInfoArgs {}

const update_specialised_object_sync_info_type = "update_specialised_object_sync_info"

const update_specialised_object_sync_info = (args: UpdateSpecialisedObjectSyncInfoArgs): ActionUpdateSpecialisedObjectSyncInfo =>
{
    return { type: update_specialised_object_sync_info_type, ...args }
}

export const is_update_specialised_object_sync_info = (action: AnyAction): action is ActionUpdateSpecialisedObjectSyncInfo => {
    return action.type === update_specialised_object_sync_info_type
}



interface UpdateNetworkStatusArgs
{
    network_functional: boolean
    last_checked: Date
}

interface ActionUpdateNetworkStatus extends Action, UpdateNetworkStatusArgs {}

const update_network_status_type = "update_network_status"

const update_network_status = (args: UpdateNetworkStatusArgs): ActionUpdateNetworkStatus =>
{
    return { type: update_network_status_type, ...args }
}

export const is_update_network_status = (action: AnyAction): action is ActionUpdateNetworkStatus => {
    return action.type === update_network_status_type
}



export const sync_actions = {
    update_sync_status,
    debug_refresh_all_specialised_object_ids_pending_save,
    update_specialised_object_sync_info,
    update_network_status,
}
