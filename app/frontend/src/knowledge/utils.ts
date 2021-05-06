import {
    ConnectionLocationType,
    ConnectionTerminalType,
    WComponent,
    wcomponent_has_existence_predictions,
    wcomponent_has_validity_predictions,
} from "../shared/models/interfaces/SpecialisedObjects"
import type { Prediction } from "../shared/models/interfaces/uncertainty"
import { get_created_at_ms, partition_and_prune_items_by_datetimes } from "../shared/models/utils_datetime"



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


export function wcomponent_present_existence_prediction_for_datetimes (wcomponent: WComponent, created_at_ms: number, sim_ms: number)
{
    let present_existence_prediction: Prediction | undefined = undefined

    const invalid = wcomponent_is_not_yet_created(wcomponent, created_at_ms)
    if (!invalid && wcomponent_has_existence_predictions(wcomponent))
    {
        present_existence_prediction = get_present_prediction(wcomponent.existence, created_at_ms, sim_ms)
    }

    return present_existence_prediction
}
export function wcomponent_existence_for_datetimes (wcomponent: WComponent, created_at_ms: number, sim_ms: number)
{
    const present_existence_prediction = wcomponent_present_existence_prediction_for_datetimes(wcomponent, created_at_ms, sim_ms)

    const existence = present_existence_prediction ? present_existence_prediction.probability : 1
    const conviction = present_existence_prediction ? present_existence_prediction.conviction : 1

    return { existence, conviction }
}



export function connection_terminal_type_to_location (type: ConnectionTerminalType | undefined, defalt: ConnectionLocationType): ConnectionLocationType
{
    if (!type) return defalt

    if (type === "effector") return "top"
    if (type === "effected") return "bottom"
    return "left"
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

    if (location === "top") type = "effector"
    else if (location === "bottom") type = "effected"
    else if (location === "left") type = "meta-effected"
    else type = "meta-effector"

    const is_effector = connection_terminal_type_is_effector(type)
    const is_meta = type === "meta-effector" || type === "meta-effected"

    return { type, is_effector, is_meta }
}


export function connection_terminal_type_is_effector (connection_terminal_type: ConnectionTerminalType)
{
    return connection_terminal_type === "effector" || connection_terminal_type === "meta-effector"
}
