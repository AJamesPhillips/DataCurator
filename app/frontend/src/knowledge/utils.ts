import { get_wcomponent_state_value } from "../shared/wcomponent/get_wcomponent_state_value"
import {
    WComponent,
    wcomponent_has_validity_predictions,
    wcomponent_has_VAP_sets,
} from "../shared/wcomponent/interfaces/SpecialisedObjects"
import type { UIStateValue } from "../shared/wcomponent/interfaces/state"
import type { Prediction, WComponentCounterfactuals } from "../shared/wcomponent/interfaces/uncertainty/uncertainty"
import { get_created_at_ms, partition_and_prune_items_by_datetimes } from "../shared/wcomponent/utils_datetime"



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


export function wcomponent_present_existence_prediction_for_datetimes (wcomponent: WComponent, wc_counterfactuals: WComponentCounterfactuals | undefined, created_at_ms: number, sim_ms: number)
{
    // let present_existence_prediction: Prediction | undefined = undefined
    let present_existence_prediction: UIStateValue | undefined = undefined

    const invalid = wcomponent_is_not_yet_created(wcomponent, created_at_ms)
    if (!invalid && wcomponent_has_VAP_sets(wcomponent))
    {
        present_existence_prediction = get_wcomponent_state_value({ wcomponent, wc_counterfactuals, created_at_ms, sim_ms })

        // present_existence_prediction = get_present_prediction([], created_at_ms, sim_ms)
    }

    return present_existence_prediction
}
export function wcomponent_existence_for_datetimes (wcomponent: WComponent, wc_counterfactuals: WComponentCounterfactuals | undefined, created_at_ms: number, sim_ms: number)
{
    const present_existence_prediction = wcomponent_present_existence_prediction_for_datetimes(wcomponent, wc_counterfactuals, created_at_ms, sim_ms)
    const pep = present_existence_prediction

    const existence = pep && pep.probability !== undefined ? pep.probability : 1
    const conviction = pep && pep.conviction !== undefined ? pep.conviction : 1

    return { existence, conviction }
}
