import type { CurrentValuePossibility } from "../shared/wcomponent/interfaces/generic_value"
import {
    WComponent,
    wcomponent_has_validity_predictions,
    wcomponent_has_VAP_sets,
    wcomponent_is_state,
} from "../shared/wcomponent/interfaces/SpecialisedObjects"
import type { Prediction, WComponentCounterfactuals } from "../shared/uncertainty/uncertainty"
import { get_created_at_ms, partition_and_prune_items_by_datetimes } from "../shared/wcomponent/utils_datetime"
import { get_VAP_set_possible_values } from "../shared/wcomponent/value_and_prediction/get_value"



export function wcomponent_is_invalid_for_datetime (wcomponent: WComponent, created_at_ms: number, sim_ms: number)
{
    return wcomponent_is_not_yet_created(wcomponent, created_at_ms)
        || wcomponent_is_now_invalid(wcomponent, created_at_ms, sim_ms)
}


function wcomponent_is_now_invalid (wcomponent: WComponent, created_at_ms: number, sim_ms: number)
{
    let invalid = false

    if (wcomponent_has_validity_predictions(wcomponent))
    {
        const last_validity_prediction = get_present_prediction(wcomponent.validity, created_at_ms, sim_ms)
        invalid = invalid || (!!last_validity_prediction
            && last_validity_prediction.conviction === 1
            && last_validity_prediction.probability === 0)
    }

    return invalid
}


function wcomponent_is_not_yet_created (wcomponent: WComponent, display_at_datetime_ms: number)
{
    return get_created_at_ms(wcomponent) > display_at_datetime_ms
}


function get_present_prediction (predictions: Prediction[], created_at_ms: number, sim_ms: number)
{
    const { present_items } = partition_and_prune_items_by_datetimes({ items: predictions, created_at_ms, sim_ms })

    return present_items.last()
}



interface WcomponentExistenceForDatetimesReturn
{
    existence: number
    conviction: number
}
// Uses the same state data attribute as the Statev2 components
export function wcomponent_existence_for_datetimes (wcomponent: WComponent, wc_counterfactuals: WComponentCounterfactuals | undefined, created_at_ms: number, sim_ms: number): WcomponentExistenceForDatetimesReturn
{
    if (wcomponent_is_state(wcomponent)) return { existence: 1, conviction: 1 }

    let present_existence_prediction: CurrentValuePossibility | undefined = undefined

    const invalid = wcomponent_is_not_yet_created(wcomponent, created_at_ms)
    if (!invalid && wcomponent_has_VAP_sets(wcomponent))
    {
        const possibilities = get_VAP_set_possible_values({
            values_and_prediction_sets: wcomponent.values_and_prediction_sets,
            VAPs_represent: { boolean: true },
            wc_counterfactuals,
            created_at_ms,
            sim_ms,
        })
        present_existence_prediction = possibilities.length === 1 ? possibilities[0] : undefined
    }

    const pep = present_existence_prediction
    const existence = pep ? pep.probability : 1
    const conviction = pep ? pep.conviction : 1

    return { existence, conviction }
}
