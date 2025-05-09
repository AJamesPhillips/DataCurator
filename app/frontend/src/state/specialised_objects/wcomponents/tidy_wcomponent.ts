import { SortDirection, sort_list } from "../../../shared/utils/sort"
import { get_created_at_ms } from "../../../shared/utils_datetime/utils_datetime"
import { set_VAP_probabilities } from "../../../wcomponent/CRUD_helpers/prepare_new_VAP"
import { get_wcomponent_VAPs_represent } from "../../../wcomponent/get_wcomponent_VAPs_represent"
import {
    WComponent,
    WComponentsById,
    wcomponent_has_VAP_sets,
    wcomponent_has_validity_predictions,
    wcomponent_is_allowed_to_have_state_VAP_sets,
} from "../../../wcomponent/interfaces/SpecialisedObjects"



export function tidy_wcomponent (wcomponent: WComponent, wcomponents_by_id: WComponentsById): WComponent
{
    if (wcomponent_has_validity_predictions(wcomponent))
    {
        const sorted_predictions = sort_list(wcomponent.validity, get_created_at_ms, SortDirection.ascending)
        wcomponent.validity = sorted_predictions
    }


    if (wcomponent_has_VAP_sets(wcomponent))
    {
        const sorted_VAP_sets = sort_list(wcomponent.values_and_prediction_sets || [], get_created_at_ms, SortDirection.ascending)

        const VAPs_represent = get_wcomponent_VAPs_represent(wcomponent, wcomponents_by_id)

        const corrected_VAPs_in_VAP_sets = sorted_VAP_sets.map(VAP_set => ({
            ...VAP_set,
            entries: set_VAP_probabilities(VAP_set.entries, VAPs_represent),
        }))

        wcomponent.values_and_prediction_sets = corrected_VAPs_in_VAP_sets
    }


    if (wcomponent_is_allowed_to_have_state_VAP_sets(wcomponent))
    {
        if (wcomponent._derived__using_value_from_wcomponent_id)
        {
            console.error(`WComponent "${wcomponent.id}" had _derived__using_value_from_wcomponent_id set ("${wcomponent._derived__using_value_from_wcomponent_id}") but this should never happen and only be used on wcomponents from state.derived.composed_wcomponents_by_id`)
        }
        // This is defensive.  This field should never be populated for a wcomponent being saved
        delete wcomponent._derived__using_value_from_wcomponent_id
    }


    return wcomponent
}
