import { get_wcomponent_state_value } from "../shared/wcomponent/get_wcomponent_state_value"
import {
    ConnectionLocationType,
    ConnectionTerminalType,
    WComponent,
    wcomponent_has_existence_predictions,
    wcomponent_has_validity_predictions,
    wcomponent_has_VAP_sets,
} from "../shared/wcomponent/interfaces/SpecialisedObjects"
import type { UIStateValue } from "../shared/wcomponent/interfaces/state"
import type { Prediction, WComponentCounterfactuals } from "../shared/wcomponent/interfaces/uncertainty"
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



export function connection_terminal_type_to_location (fromto: "from" | "to", type: ConnectionTerminalType): ConnectionLocationType
{
    if (type === "meta") return "left"
    if (fromto === "to") return "bottom"
    if (fromto === "from") return "top"

    return "left" // should never be reached
}

interface ConnectionTerminalLocationToTypeReturn
{
    type: ConnectionTerminalType
    is_effector: boolean
    is_meta: boolean
}
export function connection_terminal_location_to_type (location: ConnectionLocationType): ConnectionTerminalLocationToTypeReturn
{
    let type: ConnectionTerminalType

    if (location === "top") type = "value"
    else if (location === "bottom") type = "value"
    else if (location === "left") type = "meta"
    else type = "meta" // should never be reached

    const is_effector = connection_terminal_type_is_effector(type)
    const is_meta = type === "meta"

    return { type, is_effector, is_meta }
}


export function connection_terminal_type_is_effector (connection_terminal_type: ConnectionTerminalType)
{
    return connection_terminal_type === "value"
}
