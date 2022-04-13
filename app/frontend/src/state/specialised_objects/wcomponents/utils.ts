import { update_substate } from "../../../utils/update_state"
import type { WComponent } from "../../../wcomponent/interfaces/SpecialisedObjects"
import type { RootState } from "../../State"
import { update_specialised_object_ids_pending_save } from "../../sync/utils"
import { update_modified_or_deleted_by } from "../update_modified_by"



export function handle_upsert_wcomponent (state: RootState, wcomponent: WComponent, is_source_of_truth?: boolean, mark_as_deleted: boolean = false): RootState
{
    // Defensive.  Extra check in case editing is attempted from a different base.
    // Not 100% sure we need to prevent editing from a different base but this approach
    // allows for a simplier approach in the code, UX & UI to be taken for now.
    if (state.user_info.chosen_base_id !== wcomponent.base_id)
    {
        console.error(`Trying to save wcomponent "${wcomponent.id}" but its base_id "${wcomponent.base_id}" || ${state.user_info.chosen_base_id}`)
        return state
    }

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



export function handle_add_wcomponent_to_store (state: RootState, wcomponent: WComponent): RootState
{
    const map = { ...state.specialised_objects.wcomponents_by_id }
    map[wcomponent.id] = wcomponent

    state = update_substate(state, "specialised_objects", "wcomponents_by_id", map)

    return state
}
