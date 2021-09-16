import type { Action, AnyAction } from "redux"

import { update_state, update_substate } from "../../utils/update_state"
import type { RootState } from "../State"
import type { StorageType, SyncState, SYNC_STATUS } from "./state"



export const sync_reducer = (state: RootState, action: AnyAction): RootState =>
{

    if (is_update_sync_status(action))
    {
        const { status, error_message = "", attempt: retry_attempt } = action
        const saving = status === "SAVING"
        const saved = status === "SAVED"
        const loaded_successfully = status === "LOADED"
        const failed = status === "FAILED"
        const ready_for_reading = status !== undefined && status !== "LOADING"
        const ready_for_writing = saved || loaded_successfully || failed

        const sync: SyncState = {
            ...state.sync,
            status,
            ready_for_reading,
            ready_for_writing,
            saving,
            error_message,
            retry_attempt,
        }

        state = update_state(state, "sync", sync)
    }


    if (is_set_next_sync_ms(action))
    {
        state = update_substate(state, "sync", "next_save_ms", action.next_save_ms)
    }


    if (is_set_used_storage_type(action))
    {
        if (action.storage_type !== "solid") throw new Error(`Unsupport storage_type: ${action.storage_type}`)
        state = update_substate(state, "sync", "use_solid_storage", action.using)
    }


    return state
}



interface UpdateSyncStatusArgs
{
    status: SYNC_STATUS
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



interface SetNextSyncMsArgs
{
    next_save_ms: number | undefined
}

interface ActionSetNextSyncMs extends Action, SetNextSyncMsArgs {}

const set_next_sync_ms_type = "set_next_sync_ms"

export const set_next_sync_ms = (args: SetNextSyncMsArgs): ActionSetNextSyncMs =>
{
    return { type: set_next_sync_ms_type, ...args }
}

const is_set_next_sync_ms = (action: AnyAction): action is ActionSetNextSyncMs => {
    return action.type === set_next_sync_ms_type
}



interface SetUsedStorageTypeArgs
{
    storage_type: "solid" // StorageType
    using: boolean
}

interface ActionSetUsedStorageType extends Action, SetUsedStorageTypeArgs {}

const set_used_storage_type_type = "set_used_storage_type"

export const set_used_storage_type = (args: SetUsedStorageTypeArgs): ActionSetUsedStorageType =>
{
    return { type: set_used_storage_type_type, ...args }
}

const is_set_used_storage_type = (action: AnyAction): action is ActionSetUsedStorageType => {
    return action.type === set_used_storage_type_type
}



export const sync_actions = {
    update_sync_status,
    set_next_sync_ms,
    set_used_storage_type,
}
