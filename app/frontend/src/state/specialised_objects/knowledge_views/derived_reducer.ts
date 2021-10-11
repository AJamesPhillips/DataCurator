import type {
    KnowledgeView,
    KnowledgeViewsById,
    KnowledgeViewWComponentIdEntryMap,
} from "../../../shared/interfaces/knowledge_view"
import { is_uuid_v4 } from "../../../shared/utils/ids"
import { is_defined } from "../../../shared/utils/is_defined"
import { sort_list } from "../../../shared/utils/sort"
import { get_sim_datetime_ms } from "../../../shared/utils_datetime/utils_datetime"
import { update_substate } from "../../../utils/update_state"
import type { WComponentPrioritisation } from "../../../wcomponent/interfaces/priorities"
import {
    wcomponent_can_render_connection,
    WComponentsById,
    WComponent,
    wcomponent_is_counterfactual_v2,
    wcomponent_is_prioritisation,
} from "../../../wcomponent/interfaces/SpecialisedObjects"
import type { WComponentType } from "../../../wcomponent/interfaces/wcomponent_base"
import type { OverlappingWcIdMap } from "../../../wcomponent_derived/interfaces/canvas"
import type { WcIdToCounterfactualsV2Map } from "../../../wcomponent_derived/interfaces/counterfactual"
import { get_wcomponent_ids_by_type } from "../../derived/get_wcomponent_ids_by_type"
import type { ComposedKnowledgeView, WComponentIdsByType } from "../../derived/State"
import type { RootState } from "../../State"
import {
    get_base_knowledge_view,
    get_nested_knowledge_view_ids,
    sort_nested_knowledge_map_ids_by_priority_then_title,
    get_wcomponents_from_state,
} from "../accessors"



export const knowledge_views_derived_reducer = (initial_state: RootState, state: RootState): RootState =>
{

    const one_or_more_knowledge_views_changed = initial_state.specialised_objects.knowledge_views_by_id !== state.specialised_objects.knowledge_views_by_id
    if (one_or_more_knowledge_views_changed)
    {
        state = update_derived_knowledge_view_state(state)
    }



    let initial_kv_id = initial_state.routing.args.subview_id
    initial_kv_id = is_uuid_v4(initial_kv_id) ? initial_kv_id : ""
    let current_kv_id = state.routing.args.subview_id
    current_kv_id = is_uuid_v4(current_kv_id) ? current_kv_id : ""
    const kv_object_id_changed = initial_kv_id !== current_kv_id
    if (kv_object_id_changed)
    {
        state = update_substate(state, "derived", "current_composed_knowledge_view", undefined)
    }


    const initial_kv = get_knowledge_view(initial_state, initial_kv_id)
    const current_kv = get_knowledge_view(state, current_kv_id)
    const kv_object_changed = initial_kv !== current_kv

    const one_or_more_wcomponents_changed = initial_state.specialised_objects.wcomponents_by_id !== state.specialised_objects.wcomponents_by_id

    const composed_kv_needs_update = kv_object_changed || one_or_more_wcomponents_changed
    const filters_changed = initial_state.filter_context !== state.filter_context


    if (current_kv)
    {
        if (composed_kv_needs_update)
        {
            const current_composed_knowledge_view = update_current_composed_knowledge_view_state(state, current_kv)
            const current_composed_knowledge_view_updated_filters = update_filters(state, current_composed_knowledge_view)

            state = update_substate(state, "derived", "current_composed_knowledge_view", current_composed_knowledge_view_updated_filters)
        }
        else if (filters_changed)
        {
            const current_composed_knowledge_view = update_filters(state, state.derived.current_composed_knowledge_view)
            state = update_substate(state, "derived", "current_composed_knowledge_view", current_composed_knowledge_view)
        }
    }


    return state
}



function update_derived_knowledge_view_state (state: RootState): RootState
{
    const { knowledge_views_by_id } = state.specialised_objects
    const knowledge_views = sort_list( Object.values(knowledge_views_by_id), ({ title }) => title, "ascending")
    const base_knowledge_view = get_base_knowledge_view(knowledge_views)
    const nested_knowledge_view_ids = get_nested_knowledge_view_ids(knowledge_views)
    sort_nested_knowledge_map_ids_by_priority_then_title(nested_knowledge_view_ids)

    state = {
        ...state,
        derived: {
            ...state.derived,
            knowledge_views,
            base_knowledge_view,
            nested_knowledge_view_ids,
        },
    }

    return state
}



function get_knowledge_view (state: RootState, id: string)
{
    return state.specialised_objects.knowledge_views_by_id[id]
}



function update_current_composed_knowledge_view_state (state: RootState, current_kv: KnowledgeView)
{
    const composed_wc_id_map = get_composed_wc_id_map(current_kv, state.specialised_objects.knowledge_views_by_id)
    remove_deleted_wcomponents(composed_wc_id_map, state.specialised_objects.wcomponents_by_id)
    // Possible optimisation: store a set of wcomponent_ids and only run the following code when
    // this set changes... may save a bunch of views from updating (and also help them run faster)
    // as many just want to know what ids are present in the knowledge view not the positions of
    // the components
    const wcomponent_ids = Object.keys(composed_wc_id_map)
    const overlapping_wc_ids = get_overlapping_wc_ids(composed_wc_id_map)
    const wc_ids_by_type = get_wcomponent_ids_by_type(state, wcomponent_ids)
    const wcomponents = get_wcomponents_from_state(state, wcomponent_ids).filter(is_defined)
    const wcomponent_nodes = wcomponents.filter(is_wcomponent_node)
    const wcomponent_connections = wcomponents.filter(wcomponent_can_render_connection)
    const wc_id_to_counterfactuals_v2_map = get_wc_id_to_counterfactuals_v2_map({
        wc_ids_by_type,
        wcomponents_by_id: state.specialised_objects.wcomponents_by_id,
    })
    const wc_id_to_active_counterfactuals_v2_map = get_wc_id_to_counterfactuals_v2_map({
        wc_ids_by_type,
        wcomponents_by_id: state.specialised_objects.wcomponents_by_id,
        active_counterfactual_ids: current_kv.active_counterfactual_v2_ids,
    })
    const prioritisations = get_prioritisations(state, wc_ids_by_type.prioritisation)

    const current_composed_knowledge_view: ComposedKnowledgeView = {
        ...current_kv,
        composed_wc_id_map,
        overlapping_wc_ids,
        wcomponent_nodes,
        wcomponent_connections,
        wc_id_to_counterfactuals_v2_map,
        wc_id_to_active_counterfactuals_v2_map,
        wc_ids_by_type,
        prioritisations,
        filters: { wc_ids_excluded_by_filters: new Set() }
    }
    // do not need to do this but helps reduce confusion when debugging
    delete (current_composed_knowledge_view as any).wc_id_map

    return current_composed_knowledge_view
}



export function get_composed_wc_id_map (knowledge_view: KnowledgeView, knowledge_views_by_id: KnowledgeViewsById)
{
    const to_compose: KnowledgeViewWComponentIdEntryMap[] = []

    const foundation_knowledge_view_ids = knowledge_view.foundation_knowledge_view_ids || []

    foundation_knowledge_view_ids.forEach(id =>
    {
        const new_kv = knowledge_views_by_id[id]
        if (!new_kv) return

        to_compose.push(new_kv.wc_id_map)
    })

    to_compose.push(knowledge_view.wc_id_map)


    const composed_wc_id_map: KnowledgeViewWComponentIdEntryMap = {}
    to_compose.forEach(map =>
    {
        Object.entries(map).forEach(([id, entry]) => composed_wc_id_map[id] = entry)
    })


    return composed_wc_id_map
}



function remove_deleted_wcomponents (composed_wc_id_map: KnowledgeViewWComponentIdEntryMap, wcomponents_by_id: WComponentsById)
{
    Object.keys(composed_wc_id_map).forEach(id =>
    {
        const wcomponent = wcomponents_by_id[id]
        if (!wcomponent) delete composed_wc_id_map[id]
        else if (wcomponent.deleted_at) delete composed_wc_id_map[id]
    })
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



function get_prioritisations (state: RootState, prioritisation_ids: Set<string>): WComponentPrioritisation[]
{
    const prioritisations = get_wcomponents_from_state(state, prioritisation_ids)
        .filter(wcomponent_is_prioritisation)

    return sort_list(prioritisations, p => (get_sim_datetime_ms(p) || Number.POSITIVE_INFINITY), "descending")
}



function update_filters (state: RootState, current_composed_knowledge_view?: ComposedKnowledgeView)
{
    if (!current_composed_knowledge_view) return undefined


    let wc_ids_excluded_by_filters: Set<string> = new Set()


    if (state.filter_context.apply_filter)
    {
        const {
            exclude_by_label_ids: exclude_by_label_ids_list,
            include_by_label_ids: include_by_label_ids_list,
            exclude_by_component_types: exclude_by_component_types_list,
            include_by_component_types: include_by_component_types_list,
        } = state.filter_context.filters

        const exclude_by_label_ids = new Set(exclude_by_label_ids_list)
        const exclude_by_component_types = new Set(exclude_by_component_types_list)
        const include_by_component_types = new Set(include_by_component_types_list)

        const current_wc_ids = Object.keys(current_composed_knowledge_view.composed_wc_id_map)
        const wc_ids_to_exclude = get_wcomponents_from_state(state, current_wc_ids)
        .filter(is_defined)
        .filter(wcomponent =>
        {
            const { label_ids = [], type } = wcomponent
            const applied_ids = new Set(label_ids)

            const labels__should_exclude = !!(label_ids.find(label_id => exclude_by_label_ids.has(label_id)))
            const labels__lacks_include = !!(include_by_label_ids_list.find(label_id => !applied_ids.has(label_id)))

            const types__should_exclude = exclude_by_component_types.has(type)
            const types__lacks_include = include_by_component_types.size > 0 && !include_by_component_types.has(type)

            const should_exclude = labels__should_exclude || labels__lacks_include || types__should_exclude || types__lacks_include

            return should_exclude
        })
        .map(({ id }) => id)


        wc_ids_excluded_by_filters = new Set(wc_ids_to_exclude)
    }


    return {
        ...current_composed_knowledge_view,
        filters: { wc_ids_excluded_by_filters }
    }
}



function get_overlapping_wc_ids (composed_wc_id_map: KnowledgeViewWComponentIdEntryMap)
{
    const map: OverlappingWcIdMap = {}

    const entries: { [coord: string]: string[] } = {}
    const overlapping_coord_keys = new Set<string>()

    Object.entries(composed_wc_id_map).forEach(([wcomponent_id, entry]) =>
    {
        if (entry.deleted) return

        const coord_key = `${entry.left},${entry.top}`
        const ids = entries[coord_key] || []
        ids.push(wcomponent_id)
        entries[coord_key] = ids
        if (ids.length > 1) overlapping_coord_keys.add(coord_key)
    })

    overlapping_coord_keys.forEach(coord_key =>
    {
        const overlapping_wcomponent_ids = entries[coord_key]!
        overlapping_wcomponent_ids.forEach((id, index) =>
        {
            const i = index + 1
            map[id] = [ ...overlapping_wcomponent_ids.slice(i), ...overlapping_wcomponent_ids.slice(0, i)]
        })
    })

    return map
}
