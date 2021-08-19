import type { Action, AnyAction } from "redux"

import { update_substate } from "../../../utils/update_state"
import type { RootState } from "../../State"
import type { BACKUP_STATUS } from "./state"



export const backup_reducer = (state: RootState, action: AnyAction): RootState =>
{

    if (is_update_backup_status(action))
    {
        state = update_substate(state, "backup", "status", action.status)
    }


    return state
}



interface UpdateBackupStatusArgs
{
    status: BACKUP_STATUS
}

interface ActionUpdateBackupStatus extends Action, UpdateBackupStatusArgs {}

const update_backup_status_type = "update_backup_status"

export const update_backup_status = (args: UpdateBackupStatusArgs): ActionUpdateBackupStatus =>
{
    return { type: update_backup_status_type, ...args }
}

const is_update_backup_status = (action: AnyAction): action is ActionUpdateBackupStatus => {
    return action.type === update_backup_status_type
}



export const backup_actions = {
    update_backup_status,
}
