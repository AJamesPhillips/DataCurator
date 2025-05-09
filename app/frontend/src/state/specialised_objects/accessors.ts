import type {
    KnowledgeView,
    KnowledgeViewTreeSortType,
    KnowledgeViewsById,
} from "../../shared/interfaces/knowledge_view"
import { get_uncertain_datetime, uncertain_datetime_is_eternal } from "../../shared/uncertainty/datetime"
import type { TemporalUncertainty } from "../../shared/uncertainty/interfaces"
import { SortDirection, sort_list } from "../../shared/utils/sort"
import { get_created_at_ms, partition_items_by_created_at_datetime } from "../../shared/utils_datetime/utils_datetime"
import {
    WComponent,
    WComponentsById,
    wcomponent_has_legitimate_non_empty_state_VAP_sets,
    wcomponent_is_allowed_to_have_state_VAP_sets,
    wcomponent_is_event,
    wcomponent_is_sub_state
} from "../../wcomponent/interfaces/SpecialisedObjects"
import type { HasVAPSetsAndMaybeValuePossibilities, StateValueAndPredictionsSet } from "../../wcomponent/interfaces/state"
import { group_versions_by_id } from "../../wcomponent_derived/value_and_prediction/group_versions_by_id"
import type { RootState } from "../State"
import type { NestedKnowledgeViewIds, NestedKnowledgeViewIdsMap } from "../derived/State"



export function get_wcomponent_from_state (state: RootState, id: string | null): WComponent | undefined
{
    return id ? state.specialised_objects.wcomponents_by_id[id] : undefined
}


export function get_wcomponents_from_ids (wcomponents_by_id: WComponentsById, ids: string[] | Set<string> | undefined): (WComponent | undefined)[]
{
    ids = ids || []
    ids = ids instanceof Set ? Array.from(ids): ids

    return ids.map(id => wcomponents_by_id[id])
}


export function get_wcomponents_from_state (state: RootState, ids: string[] | Set<string> | undefined): (WComponent | undefined)[]
{
    ids = ids || []
    ids = ids instanceof Set ? Array.from(ids): ids

    return ids.map(id => get_wcomponent_from_state(state, id))
}



export function get_current_composed_knowledge_view_from_state (state: RootState)
{
    return state.derived.current_composed_knowledge_view
}
export function get_current_knowledge_view_from_state (state: RootState)
{
    return state.specialised_objects.knowledge_views_by_id[state.routing.args.subview_id]
}



export function is_on_current_knowledge_view (state: RootState, wcomponent_id: string)
{
    const kv = get_current_knowledge_view_from_state(state)
    if (!kv) return false

    const entry = kv.wc_id_map[wcomponent_id]

    return !!entry && !entry.passthrough
}



export function get_knowledge_view_from_state (state: RootState, knowledge_view_id: string): KnowledgeView | undefined
{
    return state.specialised_objects.knowledge_views_by_id[knowledge_view_id]
}



interface KnowledgeViewWithParentId extends KnowledgeView
{
    parent_knowledge_view_id: string
}


export function get_nested_knowledge_view_ids (knowledge_views: KnowledgeView[], chosen_base_id: number | undefined): NestedKnowledgeViewIds
{
    const all_kvs_ids_any_base = new Set(knowledge_views.map(kv => kv.id))
    knowledge_views = knowledge_views.filter(kv => kv.base_id === chosen_base_id)
    const all_kvs_ids_only_this_base = new Set(knowledge_views.map(kv => kv.id))


    const map: NestedKnowledgeViewIds = { top_ids: [], map: {} }

    const unused_knowledge_views: KnowledgeViewWithParentId[] = []
    knowledge_views.forEach(kv =>
    {
        const { parent_knowledge_view_id, title, sort_type = "normal" } = kv
        if (parent_knowledge_view_id)
        {
            unused_knowledge_views.push({ ...kv, parent_knowledge_view_id })
        }
        else
        {
            map.top_ids.push(kv.id)
            map.map[kv.id] = { id: kv.id, title, sort_type, parent_id: undefined, child_ids: [] }
        }
    })


    add_child_views(all_kvs_ids_any_base, all_kvs_ids_only_this_base, unused_knowledge_views, map, chosen_base_id)

    return map
}



function add_child_views (all_kvs_ids_any_base: Set<string>, all_kvs_ids_only_this_base: Set<string>, potential_children: KnowledgeViewWithParentId[], map: NestedKnowledgeViewIds, chosen_base_id: number | undefined)
{
    if (potential_children.length === 0) return


    const lack_parent: KnowledgeViewWithParentId[] = []

    potential_children.forEach(potential_child =>
    {
        const parent_kv = map.map[potential_child.parent_knowledge_view_id]
        if (parent_kv)
        {
            const { id, title, sort_type = "normal" } = potential_child
            parent_kv.child_ids.push(id)

            map.map[id] = {
                id, title, sort_type, parent_id: parent_kv.id, child_ids: []
            }
        }
        else lack_parent.push(potential_child)
    })


    if (potential_children.length === lack_parent.length)
    {
        const lack_parent_in_this_base = lack_parent.filter(kv => kv.base_id === chosen_base_id)
        if (lack_parent_in_this_base.length)
        {
            // This says "maybe" because if the knowledge view is nested under a
            // knowledge view in a different base then it's ok as its parent
            // exists just in a different base.  i.e. we're in knowledge base 1,
            // this component kv belongs to knowledge base 1, but it has been nested
            // under a view that is owner by knowledge base 2.
            console.warn(`Maybe broken knowledge view tree.  Look in "Views" for:\n * ${lack_parent_in_this_base.map(kv => `${kv.title} ${kv.id}`).join("\n * ")}`)
        }

        lack_parent.forEach(({ id, title, parent_knowledge_view_id }) =>
        {
            map.top_ids.push(id)

            const ERROR_is_circular = all_kvs_ids_only_this_base.has(parent_knowledge_view_id)
            const ERROR_parent_kv_missing = !all_kvs_ids_any_base.has(parent_knowledge_view_id)
            const ERROR_parent_from_diff_base = !ERROR_is_circular && !ERROR_parent_kv_missing

            map.map[id] = {
                id,
                title,
                sort_type: "errored",
                parent_id: undefined,
                child_ids: [],
                ERROR_is_circular,
                ERROR_parent_kv_missing,
                ERROR_parent_from_diff_base,
            }
        })
    }
    else
    {
        add_child_views(all_kvs_ids_any_base, all_kvs_ids_only_this_base, lack_parent, map, chosen_base_id)
    }
}



export function sort_nested_knowledge_map_ids_by_priority_then_title (map: NestedKnowledgeViewIds)
{
    map.top_ids = sort_knowledge_map_ids_by_priority_then_title(map.top_ids, map.map)

    Object.values(map.map).forEach(entry =>
    {
        entry.child_ids = sort_knowledge_map_ids_by_priority_then_title(entry.child_ids, map.map)
    })
}



const sort_type_to_prefix: { [sort_type in KnowledgeViewTreeSortType]: string } = {
    priority: "0",
    normal: "1",
    hidden: "2",
    archived: "3",
    errored: "4",
}
function sort_knowledge_map_ids_by_priority_then_title (ids: string[], map: NestedKnowledgeViewIdsMap)
{
    return sort_list(ids, id =>
    {
        const entry = map[id]!
        return sort_type_to_prefix[entry.sort_type] + entry.title.toLowerCase()
    }, SortDirection.ascending)
}



export function wcomponent_has_knowledge_view (wcomponent_id: string, knowledge_views_by_id: KnowledgeViewsById)
{
    return !!knowledge_views_by_id[wcomponent_id]
}



export function get_current_datetime_from_wcomponent (wcomponent_id: string, wcomponents_by_id: WComponentsById, created_at_ms: number): Date | undefined
{
    const temporal_value_certainty = get_current_temporal_value_certainty_from_wcomponent(wcomponent_id, wcomponents_by_id, created_at_ms)

    return get_uncertain_datetime(temporal_value_certainty?.temporal_uncertainty)
}

// Need to keep in sync with wc_ids_by_type.has_single_datetime
export function get_current_temporal_value_certainty_from_wcomponent (wcomponent_id: string, wcomponents_by_id: WComponentsById, created_at_ms: number): TemporalValueCertainty | undefined
{
    const wcomponent = wcomponents_by_id[wcomponent_id]

    if (wcomponent_is_event(wcomponent))
    {
        let { event_at = [] } = wcomponent
        // For now there is only one or 0 event_at predictions
        // event_at = partition_items_by_created_at_datetime({ items: event_at, created_at_ms }).current_items
        // event_at = sort_list(event_at, get_created_at_ms, SortDirection.descending)
        const prediction = event_at[0]
        if (!prediction) return undefined

        const temporal_uncertainty = prediction.datetime
        const certainty = prediction.probability * prediction.conviction

        return { temporal_uncertainty, certainty }
    }

    else if (wcomponent_is_sub_state(wcomponent))
    {
        const { target_wcomponent_id, selector } = wcomponent
        const maybe_target_wcomponent = wcomponents_by_id[target_wcomponent_id || ""]
        const target_wcomponent = wcomponent_is_allowed_to_have_state_VAP_sets(maybe_target_wcomponent) && maybe_target_wcomponent
        if (!target_wcomponent || !selector) return undefined

        const { target_VAP_set_id } = selector
        if (!target_VAP_set_id) return undefined

        let { values_and_prediction_sets: target_VAP_sets } = target_wcomponent

        // We know that counterfactuals do not effect the time yet so we don't need to to this yet.
        // const VAP_set_id_to_counterfactual_v2_map = get_VAP_set_id_to_counterfactual_v2_map(state, target_wcomponent_id)

        target_VAP_sets = target_VAP_sets.filter(({ id }) => id === target_VAP_set_id)
        target_VAP_sets = partition_items_by_created_at_datetime({ items: target_VAP_sets, created_at_ms }).current_items
        target_VAP_sets = sort_list(target_VAP_sets, get_created_at_ms, SortDirection.descending)
        const target_VAP_set = target_VAP_sets[0]
        return convert_VAP_set_to_temporal_certainty(target_VAP_set)
    }

    else if (wcomponent && wcomponent_has_legitimate_non_empty_state_VAP_sets(wcomponent))
    {
        const VAP_set = wcomponent_has_single_statev2_datetime(wcomponent)
        if (VAP_set)
        {
            return convert_VAP_set_to_temporal_certainty(VAP_set)
        }
    }

    return undefined
}



export function wcomponent_has_single_statev2_datetime (wcomponent: HasVAPSetsAndMaybeValuePossibilities)
{

    let VAP_sets = wcomponent.values_and_prediction_sets || []
    VAP_sets = group_versions_by_id(VAP_sets).latest
    const VAP_set = VAP_sets[0]
    if (VAP_set && VAP_sets.length === 1)
    {
        return VAP_set
    }

    const non_eternal_VAP_sets = VAP_sets.filter(VAP_set => !uncertain_datetime_is_eternal(VAP_set.datetime))
    const non_eternal_VAP_set = non_eternal_VAP_sets[0]
    if (non_eternal_VAP_set && non_eternal_VAP_sets.length === 1)
    {
        return non_eternal_VAP_set
    }

    return false
}



// I do not like making up new names but I don't know what else to call this.
// It is a predictions place in time and how much certainty it reflects.
export interface TemporalValueCertainty
{
    temporal_uncertainty: TemporalUncertainty
    certainty: number | undefined
}
function convert_VAP_set_to_temporal_certainty (VAP_set?: StateValueAndPredictionsSet)
{
    if (!VAP_set) return undefined

    let certainty: number | undefined = undefined

    const shared_conviction = VAP_set.shared_entry_values?.conviction
    VAP_set.entries.forEach(VAP =>
    {
        const VAP_certainty = VAP.probability * (shared_conviction !== undefined ? shared_conviction : VAP.conviction)
        certainty = Math.max(certainty || 0, VAP_certainty)
    })

    return { temporal_uncertainty: VAP_set.datetime, certainty }
}
