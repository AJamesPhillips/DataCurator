import type { Action, AnyAction } from "redux"

import { update_state, update_substate } from "../../utils/update_state"
import type { RootState } from "../State"
import type { StorageType, SyncState, SYNC_STATUS } from "./state"



export const sync_reducer = (state: RootState, action: AnyAction): RootState =>
{

    if (is_update_sync_status(action))
    {
        const { status, error_message = "" } = action
        const saving = status === "SAVING"
        const sync: SyncState = {
            ...state.sync,
            ready: saving || status === undefined,
            saving,
            status,
            error_message,
        }

        state = update_state(state, "sync", sync)
    }


    if (is_update_storage_type(action))
    {
        state = update_substate(state, "sync", "storage_type", action.storage_type)
    }


    return state
}



interface UpdateSyncStatusStatementArgs
{
    status: SYNC_STATUS
    error_message?: string
}

interface ActionUpdateSyncStatusStatement extends Action, UpdateSyncStatusStatementArgs {}

const update_sync_status_type = "update_sync_status"

export const update_sync_status = (args: UpdateSyncStatusStatementArgs): ActionUpdateSyncStatusStatement =>
{
    return { type: update_sync_status_type, ...args }
}

const is_update_sync_status = (action: AnyAction): action is ActionUpdateSyncStatusStatement => {
    return action.type === update_sync_status_type
}



interface UpdateStorageTypeArgs
{
    storage_type: StorageType
}

interface ActionUpdateStorageType extends Action, UpdateStorageTypeArgs {}

const update_storage_type_type = "update_storage_type"

export const update_storage_type = (args: UpdateStorageTypeArgs): ActionUpdateStorageType =>
{
    return { type: update_storage_type_type, ...args }
}

const is_update_storage_type = (action: AnyAction): action is ActionUpdateStorageType => {
    return action.type === update_storage_type_type
}



export const sync_actions = {
    update_sync_status,
    update_storage_type,
}
