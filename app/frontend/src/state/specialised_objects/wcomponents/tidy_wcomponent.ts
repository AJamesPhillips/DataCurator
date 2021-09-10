import { set_VAP_probabilities } from "../../../knowledge/multiple_values/utils"
import { sort_list } from "../../../shared/utils/sort"
import { get_wcomponent_VAPsType } from "../../../shared/wcomponent/get_wcomponent_state_value"
import {
    WComponent,
    wcomponent_has_validity_predictions,
    wcomponent_has_VAP_sets,
    wcomponent_is_statev1,
} from "../../../shared/wcomponent/interfaces/SpecialisedObjects"
import { get_created_at_ms } from "../../../shared/utils_datetime/utils_datetime"



export function tidy_wcomponent (wcomponent: WComponent): WComponent
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


    if (wcomponent_has_VAP_sets(wcomponent))
    {
        const sorted_VAP_sets = sort_list(wcomponent.values_and_prediction_sets || [], get_created_at_ms, "ascending")

        const VAPs_represent = get_wcomponent_VAPsType(wcomponent)

        const corrected_VAPs_in_VAP_sets = sorted_VAP_sets.map(VAP_set => ({
            ...VAP_set,
            entries: set_VAP_probabilities(VAP_set.entries, VAPs_represent),
        }))

        wcomponent.values_and_prediction_sets = corrected_VAPs_in_VAP_sets
    }

    return wcomponent
}
