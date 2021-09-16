import { pick } from "../../shared/utils/pick"
import type { RootState } from "../State"
import { get_persisted_state_object, persist_state_object } from "../persistence/persistence_utils"
import type { SyncState } from "./state"
import { selector_is_using_solid_for_storage } from "./selector"



export function sync_persist (state: RootState)
{
    const to_persist = pick([
        "use_solid_storage",
    ], state.sync)

    persist_state_object("sync", to_persist)
}



export function sync_starting_state (): SyncState
{
    const obj = get_persisted_state_object<SyncState>("sync")

    const state: SyncState = {
        status: undefined,
        ready_for_reading: false,
        ready_for_writing: false,
        saving: false,
        error_message: "",
        use_solid_storage: false,
        // TODO: remove these two fields
        storage_type: "local_storage",
        copy_from_storage_type: false,

        retry_attempt: undefined,
        next_save_ms: undefined,
        ...obj,
    }

    return state
}



export function onload_is_using_solid_for_storage ()
{
    return selector_is_using_solid_for_storage({ sync: sync_starting_state() })
}
