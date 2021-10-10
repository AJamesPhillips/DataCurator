import { WComponent, wcomponent_has_validity_predictions } from "../wcomponent/interfaces/SpecialisedObjects"
import type { CurrentValidityValueAndProbabilities } from "../wcomponent/interfaces/value_probabilities_etc"
import { calc_prediction_is_uncertain } from "./calc_prediction_is_uncertain"
import { partition_and_prune_items_by_datetimes_and_versions } from "./value_and_prediction/partition_and_prune_items_by_datetimes_and_versions"




const default_value = (): CurrentValidityValueAndProbabilities => ({
    probabilities: [],
    is_defined: false,
    value: true,
    probability: 1,
    conviction: 1,
    certainty: 1,
    uncertain: false,
    assumed: false,
})


interface GetWcomponentStateValueArgs
{
    wcomponent: WComponent
    created_at_ms: number
    sim_ms: number
}
export function get_wcomponent_validity_value (args: GetWcomponentStateValueArgs): CurrentValidityValueAndProbabilities
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
    const active_validity = partition_and_prune_items_by_datetimes_and_versions({ items: wcomponent.validity, created_at_ms, sim_ms }).present_items.last()

    if (!active_validity) return default_value()

    const { probability, conviction } = active_validity
    const valid = probability > 0.5
    const uncertain = calc_prediction_is_uncertain({ probability, conviction })
    const certainty = Math.min(probability, conviction)

    return {
        probabilities: [], // TODO this will get values once we're using VAPs
        is_defined: true,
        value: valid,
        uncertain,
        probability,
        conviction,
        certainty,
        assumed: false,
    }
}
