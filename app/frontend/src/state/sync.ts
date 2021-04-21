import type { Action, AnyAction } from "redux"

import type { RootState, SYNC_STATUS } from "./State"



export const sync_reducer = (state: RootState, action: AnyAction): RootState =>
{

    if (is_update_sync_status(action))
    {
        state = {
            ...state,
            sync: {
                ready: action.status !== "LOADING",
                saving: action.status === "SAVING",
                status: action.status,
            }
        }
    }

    return state
}


//

interface ActionUpdateSyncStatusStatement extends Action {
    status: SYNC_STATUS
}

const update_sync_status_type = "update_sync_status"

export const update_sync_status = (status: SYNC_STATUS): ActionUpdateSyncStatusStatement =>
{
    return { type: update_sync_status_type, status }
}

const is_update_sync_status = (action: AnyAction): action is ActionUpdateSyncStatusStatement => {
    return action.type === update_sync_status_type
}


export const sync_actions = {
    update_sync_status
}
