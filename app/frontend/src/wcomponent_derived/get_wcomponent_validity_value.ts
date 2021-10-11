import { WComponent, wcomponent_has_validity_predictions } from "../wcomponent/interfaces/SpecialisedObjects"
import type { DerivedValidityForUI } from "./interfaces/value"
import { calc_prediction_certainty } from "./prediction_uncertainty"
import {
    partition_and_prune_items_by_datetimes_and_versions,
} from "./value_and_prediction/partition_and_prune_items_by_datetimes_and_versions"




const default_value = (): DerivedValidityForUI => ({
    is_defined: false,
    is_valid: true,
    certainty: 1,
})


interface GetWcomponentStateValueArgs
{
    wcomponent: WComponent
    created_at_ms: number
    sim_ms: number
}
export function get_wcomponent_validity_value (args: GetWcomponentStateValueArgs): DerivedValidityForUI
{
    const { wcomponent, created_at_ms, sim_ms } = args

    if (!wcomponent_has_validity_predictions(wcomponent)) return default_value()

    // TODO upgrade validities from simple predictions to VAP_sets
    // get_VAP_set_possible_values({
    //     values_and_prediction_sets: wcomponent.validity,
    //     VAPs_represent,
    //     wc_counterfactuals,
    //     created_at_ms,
    //     sim_ms,
    // })

    // .values are sorted created_at ascending
    const active_validity = partition_and_prune_items_by_datetimes_and_versions({ items: wcomponent.validity, created_at_ms, sim_ms }).present_item

    if (!active_validity) return default_value()

    const valid = active_validity.probability > 0.5
    const certainty = calc_prediction_certainty(active_validity)

    return {
        is_defined: true,
        is_valid: valid,
        certainty,
    }
}
