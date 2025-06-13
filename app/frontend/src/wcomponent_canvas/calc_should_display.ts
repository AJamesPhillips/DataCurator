import type { KnowledgeViewWComponentEntry } from "../shared/interfaces/knowledge_view"
import { get_created_at_ms } from "../shared/utils_datetime/utils_datetime"
import {
    WComponent,
    WComponentConnection
} from "../wcomponent/interfaces/SpecialisedObjects"



type CalcWcomponentShouldDisplayArgs =
{
    wcomponent: WComponent
    kv_entry: KnowledgeViewWComponentEntry | undefined
    created_at_ms: number
    sim_ms: number
    wc_ids_excluded_by_filters: Set<string>
}
&
(
    { selected_wcomponent_ids_set: Set<string> }
    |
    { is_selected: boolean }
)
export function calc_wcomponent_should_display (args: CalcWcomponentShouldDisplayArgs): boolean
{
    const { wcomponent, kv_entry, sim_ms, wc_ids_excluded_by_filters } = args


    if (!kv_entry || kv_entry.blocked) return false

    let is_selected = "is_selected" in args ? args.is_selected : false
    if ("selected_wcomponent_ids_set" in args)
    {
        is_selected = args.selected_wcomponent_ids_set.has(wcomponent.id)
    }

    if (is_selected) return true


    if (wc_ids_excluded_by_filters.has(wcomponent.id)) return false


    // Do not show nodes if they do no exist yet
    const is_not_created = wcomponent_is_not_yet_created(wcomponent, args.created_at_ms)
    if (is_not_created) return false


    return true
}



function wcomponent_is_not_yet_created (wcomponent: WComponent, display_at_datetime_ms: number)
{
    return get_created_at_ms(wcomponent) > display_at_datetime_ms
}


export interface CalculateConnectionCertaintyArgs
{
    wcomponent: WComponentConnection
    kv_entry: KnowledgeViewWComponentEntry | undefined
    from_wc: WComponent | undefined
    to_wc: WComponent | undefined
    from_wc__kv_entry: KnowledgeViewWComponentEntry | undefined
    to_wc__kv_entry: KnowledgeViewWComponentEntry | undefined
    created_at_ms: number
    sim_ms: number
    selected_wcomponent_ids_set: Set<string>
    wc_ids_excluded_by_filters: Set<string>
}
export function calc_connection_wcomponent_should_display (args: CalculateConnectionCertaintyArgs): boolean
{
    const { from_wc, from_wc__kv_entry, to_wc, to_wc__kv_entry } = args

    const connection_should_display = calc_wcomponent_should_display(args)
    if (!connection_should_display) return false


    // Allow connections to non-existant components as these components may exist in a different base
    if (!from_wc || !to_wc) return true


    if (!from_wc__kv_entry || !to_wc__kv_entry) return false


    const from_node_should_display = calc_wcomponent_should_display({
        ...args, wcomponent: from_wc, kv_entry: from_wc__kv_entry,
    })
    if (!from_node_should_display) return false

    const to_node_should_display = calc_wcomponent_should_display({
        ...args, wcomponent: to_wc, kv_entry: to_wc__kv_entry,
    })
    if (!to_node_should_display) return false

    return true
}



interface CalcDisplayOpacityArgs
{
    is_editing: boolean
    is_highlighted?: boolean
    connected_neighbour_is_highlighted?: boolean
    is_selected?: boolean
    is_current_item: boolean
    focused_mode: boolean
}
export function calc_display_opacity (args: CalcDisplayOpacityArgs)
{
    if (args.is_highlighted || args.is_selected || args.is_current_item) return 1

    if (args.connected_neighbour_is_highlighted) return 1

    if (args.focused_mode) return 0.1

    if (args.is_editing) return 1

    return 1
}
