import { set_VAP_probabilities } from "../../../knowledge/multiple_values/utils"
import { sort_list } from "../../../shared/utils/sort"
import {
    WComponent,
    wcomponent_has_validity_predictions,
    wcomponent_is_statev1,
    wcomponent_is_statev2,
} from "../../../shared/wcomponent/interfaces/SpecialisedObjects"
import { get_created_at_ms } from "../../../shared/wcomponent/utils_datetime"
import { subtype_to_VAPsType } from "../../../shared/wcomponent/value_and_prediction/utils"



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

    if (wcomponent_is_statev2(wcomponent))
    {
        const sorted_VAP_sets = sort_list(wcomponent.values_and_prediction_sets || [], get_created_at_ms, "ascending")

        const VAPs_represent = subtype_to_VAPsType(wcomponent.subtype)

        const corrected_VAPs_in_VAP_sets = sorted_VAP_sets.map(VAP_set => ({
            ...VAP_set,
            entries: set_VAP_probabilities(VAP_set.entries, VAPs_represent),
        }))

        wcomponent.values_and_prediction_sets = corrected_VAPs_in_VAP_sets
    }

    return wcomponent
}
