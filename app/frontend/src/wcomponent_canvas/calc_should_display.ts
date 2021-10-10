import type { Prediction } from "../shared/uncertainty/interfaces"
import { rescale } from "../shared/utils/bounded"
import { get_wcomponent_validity_value } from "../wcomponent/get_wcomponent_validity_value"
import { Tense } from "../wcomponent/interfaces/datetime"
import type { WComponentJudgement } from "../wcomponent/interfaces/judgement"
import {
    WComponent,
    WComponentConnection,
    wcomponent_has_event_at,
    wcomponent_is_judgement_or_objective,
} from "../wcomponent/interfaces/SpecialisedObjects"
import { get_created_at_ms } from "../shared/utils_datetime/utils_datetime"
import type { ValidityFilterOption, CertaintyFormattingOption } from "../state/display_options/state"
import { get_tense_of_uncertain_datetime } from "../shared/utils_datetime/get_tense_of_uncertain_datetime"
import type { CurrentValidityValueAndProbabilities } from "../wcomponent/interfaces/value_probabilities_etc"



interface CalcWcomponentShouldDisplayArgs
{
    is_editing: boolean
    force_displaying: boolean
    is_selected: boolean
    wcomponent: WComponent
    created_at_ms: number
    sim_ms: number
    validity_filter: ValidityFilterOption
    wc_ids_excluded_by_filters: Set<string>
}
export function calc_wcomponent_should_display (args: CalcWcomponentShouldDisplayArgs): false | { display_certainty: number }
{
    const { is_editing, force_displaying, is_selected, wcomponent, sim_ms, wc_ids_excluded_by_filters } = args


    if (force_displaying || is_selected) return { display_certainty: 1 }


    if (wc_ids_excluded_by_filters.has(wcomponent.id)) return false


    // Do not show nodes if they do no exist yet
    const is_not_created = wcomponent_is_not_yet_created(wcomponent, args.created_at_ms)
    if (is_not_created) return false


    // Do not show judgements / objectives unless in editing or they are selected
    if (!is_editing && !is_selected && wcomponent_is_judgement_or_objective(wcomponent)) return false


    const validity_value = get_wcomponent_validity_value(args)
    // Do not show nodes if they are invalid
    const is_invalid_for_display = get_wcomponent_is_invalid_for_display({
        validity_value, validity_filter: args.validity_filter,
    })
    if (is_invalid_for_display) return false


    let certainty = validity_value.certainty
    if (wcomponent_has_event_at(wcomponent))
    {
        const event_certainty = get_certainty_for_wcomponent_event_at({ event_at: wcomponent.event_at, sim_ms })
        if (event_certainty !== undefined) certainty = Math.min(certainty, event_certainty)
    }


    return { display_certainty: certainty }
}



function wcomponent_is_not_yet_created (wcomponent: WComponent, display_at_datetime_ms: number)
{
    return get_created_at_ms(wcomponent) > display_at_datetime_ms
}



interface GetWcomponentIsInvalidForDisplayArgs
{
    validity_value: CurrentValidityValueAndProbabilities
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



interface GetCertaintyForWcomponentEventAtArgs
{
    event_at: Prediction[]
    sim_ms: number
}
function get_certainty_for_wcomponent_event_at (args: GetCertaintyForWcomponentEventAtArgs)
{
    const { event_at, sim_ms } = args

    const event_prediction = event_at[0]
    if (!event_prediction) return undefined

    const tense = get_tense_of_uncertain_datetime(event_prediction, sim_ms)

    return (tense === Tense.future) ? 0 : 1
}




interface CalculateConnectionCertaintyArgs
{
    is_editing: boolean
    force_displaying: boolean
    is_selected: boolean
    wcomponent: WComponentConnection
    validity_filter: ValidityFilterOption
    from_wc: WComponent | undefined
    to_wc: WComponent | undefined
    created_at_ms: number
    sim_ms: number
    wc_ids_excluded_by_filters: Set<string>
}
export function calc_connection_wcomponent_should_display (args: CalculateConnectionCertaintyArgs): false | { display_certainty: number }
{
    const { from_wc, to_wc } = args

    if (!from_wc || !to_wc) return false


    const connection_validity_value = calc_wcomponent_should_display(args)
    if (!connection_validity_value) return false

    const from_node_validity_value = calc_wcomponent_should_display({ ...args, wcomponent: from_wc })
    if (!from_node_validity_value) return false

    const to_node_validity_value = calc_wcomponent_should_display({ ...args, wcomponent: to_wc })
    if (!to_node_validity_value) return false

    // TODO add existence prediction

    const connection_certainty = Math.min(
        connection_validity_value.display_certainty, from_node_validity_value.display_certainty, to_node_validity_value.display_certainty
    )

    return {
        display_certainty: connection_certainty,
    }
}




interface CalculateJudgementCertaintyArgs
{
    is_editing: boolean
    force_displaying: boolean
    is_selected: boolean
    wcomponent: WComponentJudgement
    validity_filter: ValidityFilterOption
    target_wc: WComponent | undefined
    created_at_ms: number
    sim_ms: number
    wc_ids_excluded_by_filters: Set<string>
}
export function calc_judgement_connection_wcomponent_should_display (args: CalculateJudgementCertaintyArgs): false | { display_certainty: number }
{
    const { target_wc } = args

    if (!target_wc) return false


    const judgement_connection_validity_value = calc_wcomponent_should_display(args)
    if (!judgement_connection_validity_value) return false

    const target_node_validity_value = calc_wcomponent_should_display({ ...args, wcomponent: target_wc })
    if (!target_node_validity_value) return false

    const judgement_connection_certainty = Math.min(
        judgement_connection_validity_value.display_certainty, target_node_validity_value.display_certainty
    )

    return {
        display_certainty: judgement_connection_certainty,
    }
}




interface CalcDisplayOpacityArgs
{
    certainty: number
    is_editing: boolean
    is_highlighted?: boolean
    is_selected?: boolean
    is_current_item: boolean
    certainty_formatting: CertaintyFormattingOption
    focused_mode: boolean
}
export function calc_display_opacity (args: CalcDisplayOpacityArgs)
{
    if (args.is_editing || args.is_highlighted || args.is_selected || args.is_current_item) return 1

    if (args.certainty_formatting.render_100_opacity && !args.focused_mode) return 1

    if (args.focused_mode) return 0.2

    const min50 = args.certainty_formatting.render_certainty_as_easier_opacity

    return args.certainty === 1 ? 1 :
        (min50 ? rescale(args.certainty, 0.4, 0.7) : rescale(args.certainty, 0.1, 0.5))
}
