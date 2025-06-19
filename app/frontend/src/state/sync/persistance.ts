import { pick } from "../../shared/utils/pick"
import type { RootState } from "../State"
import { DependenciesForGettingStartingState } from "../interfaces"
import { persist_state_object } from "../persistence/persistence_utils"
import type { SyncState, SyncStateForDataType } from "./state"



export function sync_persist (state: RootState)
{
    const to_persist = pick([
    ], state.sync)

    persist_state_object("sync", to_persist)
}



export function sync_starting_state (deps: DependenciesForGettingStartingState): SyncState
{
    const obj = deps.get_persisted_state_object<SyncState>("sync")

    const default_sync_state_for_one_data_type: SyncStateForDataType = {
        status: undefined,
        error_message: "",
        retry_attempt: undefined,
        loading_base_id: undefined,
    }

    const state: SyncState = {
        last_source_of_truth_specialised_objects_by_id: {
            wcomponents: {},
            knowledge_views: {},
        },
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

        network_functional: true,
        network_function_last_checked: undefined,

        wcomponent_ids_to_search_for_in_any_base: new Set(),
        wcomponent_ids_searching_for_in_any_base: new Set(),
        wcomponent_ids_searched_for_in_any_base: new Set(),

        bases: { ...default_sync_state_for_one_data_type },
        specialised_objects: { ...default_sync_state_for_one_data_type },

        ...obj,
    }

    return state
}
