import type { Action, AnyAction } from "redux"

import { update_state } from "../utils/update_state"
import type { RootState, SyncState, SYNC_STATUS } from "./State"



export const sync_reducer = (state: RootState, action: AnyAction): RootState =>
{

    if (is_update_sync_status(action))
    {
        const { status, error_message = "" } = action
        const saving = status === "SAVING"
        const sync: SyncState = {
            ready: saving || status === undefined,
            saving,
            status,
            error_message,
        }

        state = update_state(state, "sync", sync)
    }

    return state
}


//
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


export const sync_actions = {
    update_sync_status
}
