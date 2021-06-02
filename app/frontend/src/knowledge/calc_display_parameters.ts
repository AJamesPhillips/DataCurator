import { rescale } from "../shared/utils/bounded"
import { CurrentValidityValue, get_wcomponent_validity_value } from "../shared/wcomponent/get_wcomponent_validity_value"
import type {
    WComponent, WComponentConnection,
} from "../shared/wcomponent/interfaces/SpecialisedObjects"
import { get_created_at_ms } from "../shared/wcomponent/utils_datetime"
import type { ValidityFilterOption, ValidityFormattingOption } from "../state/display_options/state"



interface CalcWcomponentShouldDisplayArgs
{
    wcomponent: WComponent
    created_at_ms: number
    sim_ms: number
    validity_filter: ValidityFilterOption
}
export function calc_wcomponent_should_display (args: CalcWcomponentShouldDisplayArgs): false | CurrentValidityValue
{
    // Do not show nodes if they do no exist yet
    const is_not_created = wcomponent_is_not_yet_created(args.wcomponent, args.created_at_ms)
    if (is_not_created) return false


    // Do not show nodes if they are invalid
    const validity_value = get_wcomponent_validity_value(args)
    const is_invalid_for_display = get_wcomponent_is_invalid_for_display({
        validity_value, validity_filter: args.validity_filter,
    })
    if (is_invalid_for_display) return false

    return validity_value
}



function wcomponent_is_not_yet_created (wcomponent: WComponent, display_at_datetime_ms: number)
{
    return get_created_at_ms(wcomponent) > display_at_datetime_ms
}



interface GetWcomponentIsInvalidForDisplayArgs
{
    validity_value: CurrentValidityValue
    validity_filter: ValidityFilterOption
}
function get_wcomponent_is_invalid_for_display (args: GetWcomponentIsInvalidForDisplayArgs)
{
    let should_display = false

    const { validity_filter: filter } = args
    const { certainty } = args.validity_value

    if (filter.show_invalid) should_display = true
    else if (filter.maybe_invalid) should_display = certainty > 0
    else if (filter.only_maybe_valid) should_display = certainty > 0.5
    else if (filter.only_certain_valid) should_display = certainty === 1
    else console.error("Unsupported validity_filter: " + JSON.stringify(filter))

    return !should_display
}




interface CalculateConnectionCertaintyArgs
{
    wcomponent: WComponentConnection
    validity_filter: ValidityFilterOption
    from_wc: WComponent | undefined
    to_wc: WComponent | undefined
    created_at_ms: number
    sim_ms: number
}
export function calc_connection_wcomponent_should_display (args: CalculateConnectionCertaintyArgs): false | CurrentValidityValue
{
    const { wcomponent, validity_filter, from_wc, to_wc, created_at_ms, sim_ms } = args

    if (!from_wc || !to_wc) return false


    const connection_validity_value = calc_wcomponent_should_display({ wcomponent, created_at_ms, sim_ms, validity_filter })
    if (!connection_validity_value) return false

    const from_node_validity_value = calc_wcomponent_should_display({ wcomponent: from_wc, created_at_ms, sim_ms, validity_filter })
    if (!from_node_validity_value) return false

    const to_node_validity_value = calc_wcomponent_should_display({ wcomponent: to_wc, created_at_ms, sim_ms, validity_filter })
    if (!to_node_validity_value) return false

    // TODO add existence prediction

    const connection_certainty = Math.min(
        connection_validity_value.certainty, from_node_validity_value.certainty, to_node_validity_value.certainty
    )

    return {
        ...connection_validity_value,
        certainty: connection_certainty,
    }
}



interface CalcDisplayOpacityArgs
{
    certainty: number
    is_editing: boolean
    is_highlighted?: boolean
    is_selected?: boolean
    is_current_item: boolean
    validity_formatting: ValidityFormattingOption
}
export function calc_display_opacity (args: CalcDisplayOpacityArgs)
{
    if (args.is_editing || args.is_highlighted || args.is_selected || args.is_current_item || args.validity_formatting.render_100_opacity) return 1

    return args.certainty === 1 ? 1 : rescale(args.certainty, 0.1, 0.5)
}
