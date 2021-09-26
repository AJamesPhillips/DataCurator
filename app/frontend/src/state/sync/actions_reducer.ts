import type { Action, AnyAction } from "redux"

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



export const sync_actions = {
    update_sync_status,
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
