import { rescale } from "../shared/utils/bounded"
import type { CurrentValidityValue } from "../shared/wcomponent/get_wcomponent_validity_value"
import type {
    WComponent,
} from "../shared/wcomponent/interfaces/SpecialisedObjects"
import { get_created_at_ms } from "../shared/wcomponent/utils_datetime"
import type { ValidityFilterOption, ValidityFormattingOption } from "../state/display_options/state"




export function wcomponent_is_not_yet_created (wcomponent: WComponent, display_at_datetime_ms: number)
{
    return get_created_at_ms(wcomponent) > display_at_datetime_ms
}



interface GetWcomponentIsInvalidForDisplayArgs
{
    validity_value: CurrentValidityValue
    validity_filter: ValidityFilterOption
}
export function get_wcomponent_is_invalid_for_display (args: GetWcomponentIsInvalidForDisplayArgs)
{
    let should_display = false

    const { validity_filter: filter } = args
    const { certainty } = args.validity_value

    if (filter.show_invalid) should_display = true
    else if (filter.maybe_invalid && certainty > 0) should_display = true
    else if (filter.only_maybe_valid && certainty > 0.5) should_display = true
    else if (filter.only_certain_valid && certainty === 1) should_display = true
    else console.error("Unsupporting validity_filter: " + filter)

    return !should_display
}



interface CalcDisplayOpacityArgs
{
    certainty: number
    is_highlighted?: boolean
    is_selected?: boolean
    is_current_item: boolean
    validity_formatting: ValidityFormattingOption
}
export function calc_display_opacity (args: CalcDisplayOpacityArgs)
{
    if (args.is_highlighted || args.is_selected || args.is_current_item || args.validity_formatting.render_100_opacity) return 1

    return args.certainty === 1 ? 1 : rescale(args.certainty, 0.1, 0.5)
}
