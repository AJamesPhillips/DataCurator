import {
    ConnectionLocationType,
    ConnectionTerminalType,
    WComponent,
    wcomponent_has_existence_predictions,
    wcomponent_has_validity_predictions,
} from "../shared/models/interfaces/SpecialisedObjects"
import { get_created_at_ms } from "../shared/models/utils_datetime"



export function wcomponent_is_invalid_for_datetime (wcomponent: WComponent, display_at_datetime_ms: number)
{
    return (wcomponent_is_now_invalid(wcomponent, display_at_datetime_ms)
        || wcomponent_is_not_yet_valid(wcomponent, display_at_datetime_ms))
}


function wcomponent_is_now_invalid (wcomponent: WComponent, display_at_datetime_ms: number)
{
    let invalid = false

    if (wcomponent_has_validity_predictions(wcomponent))
    {
        const last_validity_prediction = wcomponent.validity[wcomponent.validity.length - 1]
        invalid = invalid || (!!last_validity_prediction
            && last_validity_prediction.conviction === 1
            && last_validity_prediction.probability === 0
            && display_at_datetime_ms > get_created_at_ms(last_validity_prediction))
    }

    return invalid
}


function wcomponent_is_not_yet_valid (wcomponent: WComponent, display_at_datetime_ms: number)
{
    return get_created_at_ms(wcomponent) > display_at_datetime_ms
}



// export function wcomponent_is_existing_for_datetime (wcomponent: WComponent, created_at_ms: number, sim_ms: number)
// {
//     let nonexistent = false

//     if (wcomponent_has_existence_predictions(wcomponent))
//     {
//         // const valid_existence_predictions = wcomponent.existence.filter(p => get_created_at_ms(p) <= created_at_ms)
//         // valid_existence_predictions.sort(({ datetime }) => {})
//         // nonexistent = (!!last_existence_prediction
//         //     && last_existence_prediction.conviction === 1
//         //     && last_existence_prediction.probability === 0
//         //     && created_at_ms > get_created_at_ms(last_existence_prediction))
//     }

//     return !nonexistent
// }



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
