import { pick } from "../../shared/utils/pick"
import type { RootState } from "../State"
import { get_persisted_state_object, persist_state_object } from "../persistence/persistence_utils"
import type { SyncState, SyncStateForDataType } from "./state"



export function sync_persist (state: RootState)
{
    const to_persist = pick([
    ], state.sync)

    persist_state_object("sync", to_persist)
}



export function sync_starting_state (): SyncState
{
    const obj = get_persisted_state_object<SyncState>("sync")

    const default_sync_state_for_one_data_type: SyncStateForDataType = {
        status: undefined,
        error_message: "",
        retry_attempt: undefined,
    }

    const state: SyncState = {
        storage_type: "supabase",
        specialised_object_ids_pending_save: {
            wcomponent_ids: new Set(),
            knowledge_view_ids: new Set(),
        },
        specialised_objects_save_conflicts: {
            wcomponent_conflicts_by_id: {},
            knowledge_view_conflicts_by_id: {},
        },
        ready_for_reading: false,
        ready_for_writing: false,

        bases: { ...default_sync_state_for_one_data_type },
        specialised_objects: { ...default_sync_state_for_one_data_type },

        ...obj,
    }

    return state
}
