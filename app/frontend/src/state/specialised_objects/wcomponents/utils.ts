import { update_substate } from "../../../utils/update_state"
import type { WComponent } from "../../../wcomponent/interfaces/SpecialisedObjects"
import type { RootState } from "../../State"
import { update_specialised_object_ids_pending_save } from "../../sync/utils"
import { update_modified_or_deleted_by } from "../update_modified_by"



export function handle_upsert_wcomponent (state: RootState, wcomponent: WComponent, is_source_of_truth?: boolean, mark_as_deleted: boolean = false): RootState
{
    const map = { ...state.specialised_objects.wcomponents_by_id }
    wcomponent = is_source_of_truth ? wcomponent : update_modified_or_deleted_by(wcomponent, state, mark_as_deleted)
    map[wcomponent.id] = wcomponent

    state = update_substate(state, "specialised_objects", "wcomponents_by_id", map)

    // Set derived data
    state = update_specialised_object_ids_pending_save(
        state, "wcomponent", wcomponent.id,
        // Can replace `!!wcomponent.needs_save` with `!is_source_of_truth`?
        !!wcomponent.needs_save)

    return state
}



export function handle_add_wcomponents_to_store (state: RootState, wcomponents: WComponent[]): RootState
{
    const map = { ...state.specialised_objects.wcomponents_by_id }
    wcomponents.forEach(wcomponent => map[wcomponent.id] = wcomponent)

    state = update_substate(state, "specialised_objects", "wcomponents_by_id", map)

    return state
}
