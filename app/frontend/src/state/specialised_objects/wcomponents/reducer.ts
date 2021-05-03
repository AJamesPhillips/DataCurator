import type { AnyAction } from "redux"

import {
    WComponent,
    wcomponent_has_validity_predictions,
    wcomponent_is_statev1,
    wcomponent_is_statev2,
} from "../../../shared/models/interfaces/SpecialisedObjects"
import { get_created_at_ms } from "../../../shared/models/utils_datetime"
import { sort_list } from "../../../shared/utils/sort"
import { update_substate, update_subsubstate } from "../../../utils/update_state"
import type { RootState } from "../../State"
import { is_upsert_wcomponent, is_delete_wcomponent } from "./actions"



export const wcomponents_reducer = (state: RootState, action: AnyAction): RootState =>
{

    if (is_upsert_wcomponent(action))
    {
        const wcomponent = tidy_wcomponent(action.wcomponent)
        const wcomponent_id = wcomponent.id


        state = update_subsubstate(state, "specialised_objects", "wcomponents_by_id", wcomponent_id, wcomponent)


        const existing = state.specialised_objects.wcomponents_by_id[wcomponent_id]
        if (existing && existing.type !== wcomponent.type)
        {
            const existing_set = new Set(state.derived.wcomponent_ids_by_type[existing.type])
            existing_set.delete(wcomponent_id)
            state = update_subsubstate(state, "derived", "wcomponent_ids_by_type", existing.type, existing_set)
        }


        const set = new Set(state.derived.wcomponent_ids_by_type[wcomponent.type])
        // id may already be in this set if it is an update rather than an insert, and if they update is of a different field
        if (!set.has(wcomponent_id))
        {
            set.add(wcomponent_id)
            state = update_subsubstate(state, "derived", "wcomponent_ids_by_type", wcomponent.type, set)
        }
    }


    if (is_delete_wcomponent(action))
    {
        const { wcomponent_id } = action
        const map = { ...state.specialised_objects.wcomponents_by_id }
        const existing = map[wcomponent_id]


        if (existing)
        {
            delete map[wcomponent_id]
            state = update_substate(state, "specialised_objects", "wcomponents_by_id", map)


            const set = new Set(state.derived.wcomponent_ids_by_type[existing.type])
            set.delete(wcomponent_id)
            state = update_subsubstate(state, "derived", "wcomponent_ids_by_type", existing.type, set)
        }
    }

    return state
}



function tidy_wcomponent (wcomponent: WComponent): WComponent
{
    if (wcomponent_has_validity_predictions(wcomponent))
    {
        const sorted_predictions = sort_list(wcomponent.validity, get_created_at_ms, "ascending")
        wcomponent.validity = sorted_predictions
    }

    if (wcomponent_is_statev1(wcomponent))
    {
        const sorted_values = sort_list(wcomponent.values || [], get_created_at_ms, "ascending")
        wcomponent.values = sorted_values
    }

    if (wcomponent_is_statev2(wcomponent))
    {
        const sorted_VAP_sets = sort_list(wcomponent.values_and_prediction_sets || [], get_created_at_ms, "ascending")
        wcomponent.values_and_prediction_sets = sorted_VAP_sets
    }

    return wcomponent
}
