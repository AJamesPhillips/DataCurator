import type { BackupState } from "./state"



export function backup_starting_state (): BackupState
{
    const state: BackupState = {
        status: undefined,
    }

    return state
}
