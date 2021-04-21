import type { AnyAction } from "redux"

import {
    WComponent,
    wcomponent_has_validity_predictions,
    wcomponent_is_state,
} from "../../../shared/models/interfaces/SpecialisedObjects"
import { get_created_at } from "../../../shared/models/utils_datetime"
import { sort_list } from "../../../utils/sort"
import { update_substate, update_subsubstate } from "../../../utils/update_state"
import type { RootState } from "../../State"
import { is_upsert_wcomponent, is_delete_wcomponent } from "./actions"



export const wcomponents_reducer = (state: RootState, action: AnyAction): RootState =>
{
    let should_update_derived_fields = false


    if (is_upsert_wcomponent(action))
    {
        const wcomponent = tidy_wcomponent(action.wcomponent)
        state = update_subsubstate(state, "specialised_objects", "wcomponents_by_id", wcomponent.id, wcomponent)

        const set = new Set(state.specialised_objects.wcomponent_ids_by_type[wcomponent.type])
        if (!set.has(wcomponent.id))
        {
            set.add(wcomponent.id)
            state = update_subsubstate(state, "specialised_objects", "wcomponent_ids_by_type", wcomponent.type, set)
        }

        should_update_derived_fields = true
    }


    if (is_delete_wcomponent(action))
    {
        const { wcomponent_id } = action
        const map = { ...state.specialised_objects.wcomponents_by_id }
        const existing = map[wcomponent_id]
        delete map[wcomponent_id]
        state = update_substate(state, "specialised_objects", "wcomponents_by_id", map)

        const set = new Set(state.specialised_objects.wcomponent_ids_by_type[existing.type])
        set.delete(wcomponent_id)
        state = update_subsubstate(state, "specialised_objects", "wcomponent_ids_by_type", existing.type, set)

        should_update_derived_fields = true
    }


    if (should_update_derived_fields)
    {
        const wcomponents = Object.values(state.specialised_objects.wcomponents_by_id)

        const specialised_objects = {
            ...state.specialised_objects,
            wcomponents,
        }

        state = {...state, specialised_objects }
    }


    return state
}



function tidy_wcomponent (wcomponent: WComponent): WComponent
{
    if (wcomponent_has_validity_predictions(wcomponent))
    {
        const sorted_predictions = sort_list(wcomponent.validity, get_created_at, "ascending")
        wcomponent.validity = sorted_predictions
    }

    if (wcomponent_is_state(wcomponent))
    {
        const sorted_values = sort_list(wcomponent.values || [], get_created_at, "ascending")
        wcomponent.values = sorted_values
    }

    return wcomponent
}
