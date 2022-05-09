import {
    calculate_canvas_x_for_wcomponent_temporal_uncertainty,
    DEFAULT_DATETIME_LINE_CONFIG,
} from "../../../knowledge_view/datetime_line"
import { get_wc_position_to_id_map } from "../../../knowledge_view/utils/get_wc_position_to_id_map"
import type {
    DatetimeLineConfig,
    DefaultDatetimeLineConfig,
} from "../../../shared/interfaces/datetime_lines"
import type {
    KnowledgeView,
    KnowledgeViewsById,
    KnowledgeViewWComponentIdEntryMap,
    // PartialKnowledgeViewWComponentIdEntryMap,
} from "../../../shared/interfaces/knowledge_view"
import { is_uuid_v4 } from "../../../shared/utils/ids"
import { is_defined } from "../../../shared/utils/is_defined"
import { SortDirection, sort_list } from "../../../shared/utils/sort"
import { get_created_at_ms, get_sim_datetime_ms } from "../../../shared/utils_datetime/utils_datetime"
import { set_union } from "../../../utils/set"
import { update_substate } from "../../../utils/update_state"
import type { WComponentPrioritisation } from "../../../wcomponent/interfaces/priorities"
import {
    wcomponent_can_render_connection,
    WComponentsById,
    WComponent,
    wcomponent_is_counterfactual_v2,
    wcomponent_is_prioritisation,
    wcomponent_is_plain_connection,
    wcomponent_has_legitimate_non_empty_state_VAP_sets,
} from "../../../wcomponent/interfaces/SpecialisedObjects"
import type { WComponentType } from "../../../wcomponent/interfaces/wcomponent_base"
import type { OverlappingWcIdMap } from "../../../wcomponent_derived/interfaces/canvas"
import type { WcIdToCounterfactualsV2Map } from "../../../wcomponent_derived/interfaces/counterfactual"
import { get_wcomponent_ids_by_type } from "../get_wcomponent_ids_by_type"
import type { ComposedKnowledgeView, DerivedAvailableFilterOptions, WComponentIdsByType } from "../State"
import type { RootState } from "../../State"
import {
    get_nested_knowledge_view_ids,
    sort_nested_knowledge_map_ids_by_priority_then_title,
    get_wcomponents_from_state,
    get_knowledge_view_from_state,
} from "../../specialised_objects/accessors"
import { calc_if_wcomponent_should_exclude_because_label_or_type } from "./calc_if_wcomponent_should_exclude_because_label_or_type"
import { get_knowledge_view_given_routing } from "./get_knowledge_view_given_routing"
import { selector_chosen_base_id } from "../../user_info/selector"



export const knowledge_views_derived_reducer = (initial_state: RootState, state: RootState): RootState =>
{

    const one_or_more_knowledge_views_changed = initial_state.specialised_objects.knowledge_views_by_id !== state.specialised_objects.knowledge_views_by_id
    if (one_or_more_knowledge_views_changed)
    {
        state = update_derived_knowledge_view_state(state)
    }


    const initial_kv = get_knowledge_view_given_routing(initial_state)
    const current_kv = get_knowledge_view_given_routing(state)
    const kv_object_id_changed = initial_kv?.id !== current_kv?.id
    if (kv_object_id_changed)
    {
        state = update_substate(state, "derived", "current_composed_knowledge_view", undefined)
    }


    const kv_object_changed = initial_kv !== current_kv

    const one_or_more_wcomponents_changed = initial_state.specialised_objects.wcomponents_by_id !== state.specialised_objects.wcomponents_by_id


    const composed_kv_needs_update = kv_object_changed || one_or_more_wcomponents_changed

    const created_at_changed = initial_state.routing.args.created_at_ms !== state.routing.args.created_at_ms
    const filters_changed = created_at_changed || initial_state.filter_context !== state.filter_context || one_or_more_wcomponents_changed

    const display_time_marks_changed = initial_state.display_options.display_time_marks !== state.display_options.display_time_marks
    const ephemeral_overrides_might_have_changed = created_at_changed || display_time_marks_changed


    if (current_kv)
    {
        if (composed_kv_needs_update)
        {
            let current_composed_knowledge_view: ComposedKnowledgeView | undefined = update_current_composed_knowledge_view_state(state, current_kv)
            current_composed_knowledge_view = update_composed_knowledge_view_filters(state, current_composed_knowledge_view)
            current_composed_knowledge_view = add_ephemeral_overrides_to_wc_id_map(state, current_composed_knowledge_view)

            state = update_substate(state, "derived", "current_composed_knowledge_view", current_composed_knowledge_view)
        }
        else if (filters_changed)
        {
            const current_composed_knowledge_view = update_composed_knowledge_view_filters(state, state.derived.current_composed_knowledge_view)
            state = update_substate(state, "derived", "current_composed_knowledge_view", current_composed_knowledge_view)
        }
        else if (ephemeral_overrides_might_have_changed)
        {
            let { current_composed_knowledge_view } = state.derived

            current_composed_knowledge_view = update_ephemeral_overrides_of_current_composed_kv(current_composed_knowledge_view, display_time_marks_changed, state, current_kv)

            state = update_substate(state, "derived", "current_composed_knowledge_view", current_composed_knowledge_view)
        }
    }


    return state
}



function update_derived_knowledge_view_state (state: RootState): RootState
{
    const { knowledge_views_by_id } = state.specialised_objects
    const chosen_base_id = selector_chosen_base_id(state)

    const knowledge_views_across_all_bases = Object.values(knowledge_views_by_id)
    const knowledge_views = sort_list(knowledge_views_across_all_bases, ({ title }) => title, SortDirection.ascending)
    const nested_knowledge_view_ids = get_nested_knowledge_view_ids(knowledge_views, chosen_base_id)
    sort_nested_knowledge_map_ids_by_priority_then_title(nested_knowledge_view_ids)

    state = {
        ...state,
        derived: {
            ...state.derived,
            knowledge_views,
            nested_knowledge_view_ids,
        },
    }

    return state
}



// possible place for optimisation which may save a bunch of views from updating (and also help them run faster)
export function update_current_composed_knowledge_view_state (state: RootState, current_kv: KnowledgeView)
{
    const { knowledge_views_by_id, wcomponents_by_id } = state.specialised_objects
    const { current_composed_knowledge_view } = state.derived

    const updated_current_composed_knowledge_view = calculate_composed_knowledge_view({
        knowledge_view: current_kv,
        current_composed_knowledge_view,
        knowledge_views_by_id,
        wcomponents_by_id,
    })

    return updated_current_composed_knowledge_view
}



interface CalculateComposedKnowledgeViewArgs
{
    knowledge_view: KnowledgeView
    current_composed_knowledge_view?: ComposedKnowledgeView
    knowledge_views_by_id: KnowledgeViewsById
    wcomponents_by_id: WComponentsById
}
export function calculate_composed_knowledge_view (args: CalculateComposedKnowledgeViewArgs)
{
    const { knowledge_view, knowledge_views_by_id, wcomponents_by_id } = args
    const current_composed_knowledge_view = args.current_composed_knowledge_view || {
        composed_visible_wc_id_map: {},
        active_judgement_or_objective_ids_by_target_id: {},
        active_judgement_or_objective_ids_by_goal_or_action_id: {},
        filters: {
            wc_ids_excluded_by_any_filter: new Set(),
            wc_ids_excluded_by_filters: new Set(),
            wc_ids_excluded_by_created_at_datetime_filter: new Set(),
            vap_set_number_excluded_by_created_at_datetime_filter: 0,
        },
    }

    const foundational_knowledge_views = get_foundational_knowledge_views(knowledge_view, knowledge_views_by_id)
    const {
        composed_wc_id_map, composed_blocked_wc_id_map
    } = get_composed_wc_id_map(foundational_knowledge_views, wcomponents_by_id)

    const overlapping_wc_ids = get_overlapping_wc_ids(composed_wc_id_map, wcomponents_by_id)

    const non_deleted_wcomponent_ids = Object.keys(composed_wc_id_map)

    const wc_ids_by_type = get_wcomponent_ids_by_type(wcomponents_by_id, non_deleted_wcomponent_ids)
    const wcomponents: WComponent[] = []
    const wcomponent_unfound_ids: string[] = []
    non_deleted_wcomponent_ids.forEach(id =>
    {
        const wcomponent = wcomponents_by_id[id]
        if (wcomponent) wcomponents.push(wcomponent)
        else wcomponent_unfound_ids.push(id)
    })
    const wcomponent_nodes = wcomponents.filter(is_wcomponent_node)
    const wcomponent_connections = wcomponents.filter(wcomponent_can_render_connection)
    const wc_id_to_counterfactuals_v2_map = get_wc_id_to_counterfactuals_v2_map({
        wc_ids_by_type,
        wcomponents_by_id,
    })
    const wc_id_to_active_counterfactuals_v2_map = get_wc_id_to_counterfactuals_v2_map({
        wc_ids_by_type,
        wcomponents_by_id,
        active_counterfactual_ids: knowledge_view.active_counterfactual_v2_ids,
    })
    const prioritisations = get_prioritisations(wc_ids_by_type.prioritisation, wcomponents_by_id)
    const wc_id_connections_map = get_wc_id_connections_map(wc_ids_by_type.any_link, wcomponents_by_id)
    const available_filter_options = get_available_filter_options(wcomponents)
    const datetime_lines_config = get_composed_datetime_lines_config(foundational_knowledge_views, true)

    const updated_composed_knowledge_view: ComposedKnowledgeView = {
        ...knowledge_view,
        ...current_composed_knowledge_view,
        composed_wc_id_map,
        composed_blocked_wc_id_map,
        overlapping_wc_ids,
        wcomponent_nodes,
        wcomponent_connections,
        wcomponent_unfound_ids,
        wc_id_to_counterfactuals_v2_map,
        wc_id_to_active_counterfactuals_v2_map,
        wc_ids_by_type,
        prioritisations,
        wc_id_connections_map,
        available_filter_options,
        composed_datetime_line_config: datetime_lines_config,
    }
    // do not need to do this but helps reduce confusion when debugging
    delete (updated_composed_knowledge_view as any).wc_id_map

    return updated_composed_knowledge_view
}



export function get_foundational_knowledge_views (knowledge_view: KnowledgeView, knowledge_views_by_id: KnowledgeViewsById, include_self = true)
{
    const { foundation_knowledge_view_ids = [] } = knowledge_view
    const foundation_knowledge_views = foundation_knowledge_view_ids.map(id => knowledge_views_by_id[id])
        .filter(is_defined)

    if (include_self) foundation_knowledge_views.push(knowledge_view)

    return foundation_knowledge_views
}



export function get_composed_wc_id_map (foundation_knowledge_views: KnowledgeView[], wcomponents_by_id: WComponentsById)
{
    let composed_wc_id_map: KnowledgeViewWComponentIdEntryMap = {}
    foundation_knowledge_views.forEach(foundational_kv =>
    {
        Object.entries(foundational_kv.wc_id_map).forEach(([id, entry]) =>
        {
            if (entry.passthrough) return

            // ensure it is deleted first so that when (re)added it will placed last (on top)
            delete composed_wc_id_map[id]
            composed_wc_id_map[id] = entry
        })
    })

    remove_deleted_wcomponents(composed_wc_id_map, wcomponents_by_id)

    const result = partition_wc_id_map_on_blocked(composed_wc_id_map)
    composed_wc_id_map = result.composed_wc_id_map
    const composed_blocked_wc_id_map = result.composed_blocked_wc_id_map

    return { composed_wc_id_map, composed_blocked_wc_id_map }
}

function remove_deleted_wcomponents (composed_wc_id_map: KnowledgeViewWComponentIdEntryMap, wcomponents_by_id: WComponentsById)
{
    Object.keys(composed_wc_id_map).forEach(id =>
    {
        const wcomponent = wcomponents_by_id[id]
        // Allow not found wcomponents to be kept as they may be from a different base and just not loaded
        // if (!wcomponent) delete composed_wc_id_map[id]
        if (wcomponent?.deleted_at) delete composed_wc_id_map[id]
    })
}

function partition_wc_id_map_on_blocked (composed_wc_id_map: KnowledgeViewWComponentIdEntryMap)
{
    const composed_blocked_wc_id_map: KnowledgeViewWComponentIdEntryMap = {}

    Object.entries(composed_wc_id_map).forEach(([wcomponent_id, entry]) =>
    {
        if (entry.blocked)
        {
            composed_blocked_wc_id_map[wcomponent_id] = entry
            delete composed_wc_id_map[wcomponent_id]
        }
    })

    return { composed_wc_id_map, composed_blocked_wc_id_map }
}



const invalid_node_types = new Set<WComponentType>([
    "causal_link",
    "relation_link",
    // "prioritisation",
    // "judgement",
    // "objective",
])
const is_wcomponent_node = (wcomponent: WComponent) => !invalid_node_types.has(wcomponent.type)



interface GetWcIdCounterfactualsV2MapArgs
{
    wc_ids_by_type: WComponentIdsByType
    wcomponents_by_id: WComponentsById
    active_counterfactual_ids?: string[]
}
function get_wc_id_to_counterfactuals_v2_map (args: GetWcIdCounterfactualsV2MapArgs): WcIdToCounterfactualsV2Map
{
    const map: WcIdToCounterfactualsV2Map = {}
    const active_counterfactual_ids = args.active_counterfactual_ids
        ? new Set(args.active_counterfactual_ids)
        : false

    args.wc_ids_by_type.counterfactualv2.forEach(id =>
    {
        if (active_counterfactual_ids && !active_counterfactual_ids.has(id)) return

        const counterfactual_v2 = args.wcomponents_by_id[id]
        if (!wcomponent_is_counterfactual_v2(counterfactual_v2)) return

        const { target_wcomponent_id, target_VAP_set_id } = counterfactual_v2
        if (!target_wcomponent_id || !target_VAP_set_id) return

        const counterfactuals_by_attribute = map[target_wcomponent_id] || { VAP_sets: {} }
        map[target_wcomponent_id] = counterfactuals_by_attribute

        const counterfactual_v2s = counterfactuals_by_attribute.VAP_sets[target_VAP_set_id] || []
        counterfactual_v2s.push(counterfactual_v2)
        counterfactuals_by_attribute.VAP_sets[target_VAP_set_id] = counterfactual_v2s
    })

    return map
}



function get_prioritisations (prioritisation_ids: Set<string>, wcomponents_by_id: WComponentsById): WComponentPrioritisation[]
{
    const prioritisations = Array.from(prioritisation_ids).map(id => wcomponents_by_id[id])
        .filter(wcomponent_is_prioritisation)

    return sort_list(prioritisations, p => (get_sim_datetime_ms(p) || get_created_at_ms(p)), SortDirection.descending)
}



function get_wc_id_connections_map (link_ids: Set<string>, wcomponents_by_id: WComponentsById)
{
    const map: {[wc_id: string]: Set<string>} = {}

    function add_entry (id: string, to_id: string)
    {
        const entries = map[id] || new Set()
        entries.add(to_id)
        map[id] = entries
    }

    function add_both_entries (connection_id: string, to_node_id: string)
    {
        add_entry(connection_id, to_node_id)
        add_entry(to_node_id, connection_id)
    }

    link_ids.forEach(id =>
    {
        const connection_wc = wcomponents_by_id[id]
        if (!wcomponent_is_plain_connection(connection_wc)) return // type guard

        if (connection_wc.from_id) add_both_entries(connection_wc.from_id, connection_wc.id)
        if (connection_wc.to_id) add_both_entries(connection_wc.to_id, connection_wc.id)
    })

    return map
}



function get_available_filter_options (wcomponents: WComponent[]): DerivedAvailableFilterOptions
{
    const wc_label_ids = new Set<string>()
    const wc_types_set = new Set<WComponentType>()

    wcomponents.forEach(wc =>
    {
        if (wc.label_ids) wc.label_ids.forEach(id => wc_label_ids.add(id))
        wc_types_set.add(wc.type)
    })

    const wc_types: WComponentType[] = Array.from(wc_types_set).sort()

    return { wc_label_ids, wc_types }
}



export function get_composed_datetime_lines_config (foundation_knowledge_views: KnowledgeView[], use_defaults: false): DatetimeLineConfig
export function get_composed_datetime_lines_config (foundation_knowledge_views: KnowledgeView[], use_defaults: true): DatetimeLineConfig & DefaultDatetimeLineConfig
export function get_composed_datetime_lines_config (foundation_knowledge_views: KnowledgeView[], use_defaults: boolean): DatetimeLineConfig
{
    let config: DatetimeLineConfig = {}

    if (use_defaults)
    {
        config = { ...DEFAULT_DATETIME_LINE_CONFIG }
    }

    foundation_knowledge_views.forEach(foundational_kv =>
    {
        const { datetime_line_config } = foundational_kv
        if (!datetime_line_config) return

        config.time_origin_ms = datetime_line_config.time_origin_ms ?? config.time_origin_ms
        config.time_origin_x = datetime_line_config.time_origin_x ?? config.time_origin_x
        config.time_scale = datetime_line_config.time_scale ?? config.time_scale
        config.time_line_number = datetime_line_config.time_line_number ?? config.time_line_number
        config.time_line_spacing_days = datetime_line_config.time_line_spacing_days ?? config.time_line_spacing_days
    })

    return config
}



export function update_composed_knowledge_view_filters (state: RootState, current_composed_knowledge_view?: ComposedKnowledgeView): ComposedKnowledgeView | undefined
{
    if (!current_composed_knowledge_view) return undefined


    const { wc_ids_by_type, composed_wc_id_map } = current_composed_knowledge_view
    const wcomponents_nodes_on_kv = get_wcomponents_from_state(state, wc_ids_by_type.any_node).filter(is_defined)
    const wcomponents_links_on_kv = get_wcomponents_from_state(state, wc_ids_by_type.any_link).filter(wcomponent_is_plain_connection)
    const wcomponents_on_kv = wcomponents_nodes_on_kv.concat(wcomponents_links_on_kv)


    const wc_ids_to_exclude = new Set<string>()
    if (state.filter_context.apply_filter)
    {
        const {
            exclude_by_label_ids: exclude_by_label_ids_list,
            include_by_label_ids: include_by_label_ids_list,
            exclude_by_component_types: exclude_by_component_types_list,
            include_by_component_types: include_by_component_types_list,
        } = state.filter_context.filters

        const exclude_by_label_ids = new Set(exclude_by_label_ids_list)
        const include_by_label_ids = new Set(include_by_label_ids_list)
        const exclude_by_component_types = new Set(exclude_by_component_types_list)
        const include_by_component_types = new Set(include_by_component_types_list)

        const args = {
            exclude_by_label_ids,
            include_by_label_ids,
            include_by_label_ids_list,
            exclude_by_component_types,
            include_by_component_types,
        }

        wcomponents_nodes_on_kv.forEach(wcomponent =>
        {
            const { should_exclude, lacks_include } = calc_if_wcomponent_should_exclude_because_label_or_type(wcomponent, args)

            if (should_exclude || lacks_include) wc_ids_to_exclude.add(wcomponent.id)
        })

        // This smells, should not be including this here as when it changes the filtered ids will be
        // stale
        const { selected_wcomponent_ids_set: selected_wc_ids } = state.meta_wcomponents

        wcomponents_links_on_kv.forEach(wcomponent =>
        {
            const { from_id, to_id } = wcomponent
            let should_exclude = !from_id || !to_id

            should_exclude = should_exclude
                || (!selected_wc_ids.has(from_id) && wc_ids_to_exclude.has(from_id))
                || (!selected_wc_ids.has(to_id) && wc_ids_to_exclude.has(to_id))

            // For connections we're only using the `should_exclude` and ignoring the `lacks_include` for now
            // later we could put this under a flag so that connections also have to have a positive inclusion
            // otherwise they will be excluded
            should_exclude = should_exclude || calc_if_wcomponent_should_exclude_because_label_or_type(wcomponent, args).should_exclude

            if (should_exclude) wc_ids_to_exclude.add(wcomponent.id)
        })
    }

    const wc_ids_excluded_by_filters = new Set(wc_ids_to_exclude)


    const { created_at_ms } = state.routing.args
    let vap_set_number_excluded_by_created_at_datetime_filter = 0
    const component_ids_excluded_by_created_at = wcomponents_on_kv
        .filter(wc =>
        {
            if (wcomponent_has_legitimate_non_empty_state_VAP_sets(wc))
            {
                wc.values_and_prediction_sets
                .forEach(vap_set =>
                {
                    if (get_created_at_ms(vap_set) > created_at_ms)
                    {
                        ++vap_set_number_excluded_by_created_at_datetime_filter
                    }
                })
            }

            return get_created_at_ms(wc) > created_at_ms
        })
        .map(({ id }) => id)
    const wc_ids_excluded_by_created_at_datetime_filter = new Set(component_ids_excluded_by_created_at)


    const wc_ids_excluded_by_any_filter = set_union(
        wc_ids_excluded_by_filters,
        wc_ids_excluded_by_created_at_datetime_filter,
    )


    const composed_visible_wc_id_map = { ...composed_wc_id_map }
    wc_ids_excluded_by_any_filter.forEach(id =>
    {
        delete composed_visible_wc_id_map[id]
    })


    return {
        ...current_composed_knowledge_view,
        composed_visible_wc_id_map,
        filters: {
            wc_ids_excluded_by_any_filter,
            wc_ids_excluded_by_filters,
            wc_ids_excluded_by_created_at_datetime_filter,
            vap_set_number_excluded_by_created_at_datetime_filter,
        }
    }
}



function get_overlapping_wc_ids (composed_wc_id_map: KnowledgeViewWComponentIdEntryMap, wcomponents_by_id: WComponentsById)
{

    const entries = get_wc_position_to_id_map(composed_wc_id_map, wcomponents_by_id)

    const map: OverlappingWcIdMap = {}
    Object.values(entries).forEach(ids =>
    {
        if (ids.length <= 1) return

        // Will convert `ids = [1, 2, 3]` into:
        // { 1: [2, 3, 1]
        //   2: [3, 1, 2]
        //   3: [1, 2, 3] }
        // This allows front end wcomponents to easily determine the id of the next overlapping wcomponent
        ids.forEach((overlapping_wcomponent_id, index) =>
        {
            const j = index + 1
            map[overlapping_wcomponent_id] = [ ...ids.slice(j), ...ids.slice(0, j)]
        })
    })

    return map
}



function update_ephemeral_overrides_of_current_composed_kv (current_composed_knowledge_view: ComposedKnowledgeView | undefined, display_time_marks_changed: boolean, state: RootState, current_kv: KnowledgeView)
{
    if (!current_composed_knowledge_view) return undefined

    if (display_time_marks_changed && !state.display_options.display_time_marks)
    {
        // restore original composed_wc_id_map
        const { knowledge_views_by_id, wcomponents_by_id } = state.specialised_objects
        const foundational_knowledge_views = get_foundational_knowledge_views(current_kv, knowledge_views_by_id)
        const composed_wc_id_maps = get_composed_wc_id_map(foundational_knowledge_views, wcomponents_by_id)

        current_composed_knowledge_view = {
            ...current_composed_knowledge_view,
            ...composed_wc_id_maps,
        }
    }
    else // if (display_time_marks_changed) // todo: should there be a conditional check on display_time_marks_changed?
    {
        current_composed_knowledge_view = add_ephemeral_overrides_to_wc_id_map(state, current_composed_knowledge_view)
    }

    return current_composed_knowledge_view
}



// Changes the `left` position of nodes iff:
//   * `display_time_marks` is true
//   * the `time_origin_ms` is set
//   * the node has temporal_uncertainty data the gives a left position
//   * this `left` is different to the `left` in the `composed_wc_id_map`
// TODO document why `composed_wc_id_map` is used and not `composed_visible_wc_id_map`, perhaps
// this is just a bug?
function add_ephemeral_overrides_to_wc_id_map (state: RootState, current_composed_knowledge_view?: ComposedKnowledgeView): ComposedKnowledgeView | undefined
{
    if (!current_composed_knowledge_view) return undefined

    const { display_time_marks } = state.display_options
    const { wc_ids_by_type, composed_wc_id_map, composed_datetime_line_config } = current_composed_knowledge_view
    const { time_origin_ms, time_origin_x, time_scale } = composed_datetime_line_config
    const { wcomponents_by_id } = state.specialised_objects
    const { created_at_ms } = state.routing.args

    if (!display_time_marks || time_origin_ms === undefined) return current_composed_knowledge_view

    const new_map: KnowledgeViewWComponentIdEntryMap = { ...composed_wc_id_map }
    let changed = false

    Array.from(wc_ids_by_type.has_single_datetime)
        .forEach(wcomponent_id =>
        {
            const existing_entry = composed_wc_id_map[wcomponent_id]
            if (!existing_entry) return

            const left = calculate_canvas_x_for_wcomponent_temporal_uncertainty({
                wcomponent_id, wcomponents_by_id, created_at_ms, time_origin_ms, time_origin_x, time_scale,
            })
            if (left === undefined || existing_entry.left === left) return

            changed = true
            new_map[wcomponent_id] = { ...existing_entry, left }
        })

    return !changed ? current_composed_knowledge_view : {
        ...current_composed_knowledge_view,
        composed_wc_id_map: new_map,
    }
}
