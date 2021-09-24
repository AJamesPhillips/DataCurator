import { pick } from "../../shared/utils/pick"
import type { RootState } from "../State"
import { get_persisted_state_object, persist_state_object } from "../persistence/persistence_utils"
import type { SyncState } from "./state"



export function sync_persist (state: RootState)
{
    const to_persist = pick([
    ], state.sync)

    persist_state_object("sync", to_persist)
}



export function sync_starting_state (): SyncState
{
    const obj = get_persisted_state_object<SyncState>("sync")

    const state: SyncState = {
        storage_type: "supabase",
        status: undefined,
        ready_for_reading: false,
        ready_for_writing: false,
        saving: false,
        error_message: "",
        retry_attempt: undefined,
        next_save_ms: undefined,
        ...obj,
    }

    return state
}
