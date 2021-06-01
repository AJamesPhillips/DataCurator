import type { CurrentValidityValue } from "../shared/wcomponent/get_wcomponent_validity_value"
import type {
    WComponent,
} from "../shared/wcomponent/interfaces/SpecialisedObjects"
import { get_created_at_ms } from "../shared/wcomponent/utils_datetime"
import type { ValidityToCertaintyTypes } from "../state/display_options/state"




export function wcomponent_is_not_yet_created (wcomponent: WComponent, display_at_datetime_ms: number)
{
    return get_created_at_ms(wcomponent) > display_at_datetime_ms
}



interface GetWcomponentIsInvalidForDisplayArgs
{
    validity_value: CurrentValidityValue
    validity_to_certainty: ValidityToCertaintyTypes
}
export function get_wcomponent_is_invalid_for_display (args: GetWcomponentIsInvalidForDisplayArgs)
{
    let is_invalid = false

    if (!args.validity_value.value && args.validity_to_certainty === "hide_invalid") is_invalid = true

    return is_invalid
}
