import type { Action, AnyAction } from "redux"

import { update_substate, update_subsubstate } from "../../utils/update_state"
import type { RootState } from "../State"
import type { SyncDataType, SyncStateForDataType, SYNC_STATUS } from "./state"



export const sync_reducer = (state: RootState, action: AnyAction): RootState =>
{

    if (is_update_sync_status(action))
    {
        const { status, error_message = "", attempt: retry_attempt } = action

        // const saved = status === "SAVED"
        // const loaded_successfully = status === "LOADED"
        // const failed = status === "FAILED"
        // const ready_for_reading = status !== undefined && status !== "LOADING"
        // const ready_for_writing = saved || loaded_successfully || failed

        const sync_state_for_data_type: SyncStateForDataType =
        {
            ...state.sync[action.data_type],
            status,
            error_message,
            retry_attempt,
        }

        state = update_substate(state, "sync", action.data_type, sync_state_for_data_type)
    }


    if (is_set_next_sync_ms(action))
    {
        state = update_subsubstate(state, "sync", action.data_type, "next_save_ms", action.next_save_ms)
    }


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



interface SetNextSyncMsArgs
{
    next_save_ms: number | undefined
    data_type: SyncDataType
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



export const sync_actions = {
    update_sync_status,
    set_next_sync_ms,
}
