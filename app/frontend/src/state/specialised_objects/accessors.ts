import {
    Perception,
    WComponent,
    WComponentsById,
    wcomponent_is_event,
    wcomponent_is_statev2,
    wcomponent_is_sub_state,
    wcomponent_should_have_state_VAP_sets,
} from "../../wcomponent/interfaces/SpecialisedObjects"
import type {
    KnowledgeView,
    KnowledgeViewsById,
    KnowledgeViewSortType,
} from "../../shared/interfaces/knowledge_view"
import type { RootState } from "../State"
import type { NestedKnowledgeViewIds, NestedKnowledgeViewIdsMap } from "../derived/State"
import { sort_list } from "../../shared/utils/sort"
import type { Prediction, TemporalUncertainty } from "../../shared/uncertainty/interfaces"
import { get_created_at_datetime, get_created_at_ms, partition_items_by_created_at_datetime } from "../../shared/utils_datetime/utils_datetime"
import { get_uncertain_datetime, uncertain_datetime_is_eternal } from "../../shared/uncertainty/datetime"
import { group_versions_by_id } from "../../wcomponent_derived/value_and_prediction/group_versions_by_id"
import type { StateValueAndPredictionsSet, WComponentNodeStateV2 } from "../../wcomponent/interfaces/state"



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



export function get_perception_from_state (state: RootState, id: string | null): Perception | undefined
{
    return id ? state.specialised_objects.perceptions_by_id[id] : undefined
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

    return !!kv.wc_id_map[wcomponent_id]
}



export function get_knowledge_view_from_state (state: RootState, knowledge_view_id: string): KnowledgeView | undefined
{
    return state.specialised_objects.knowledge_views_by_id[knowledge_view_id]
}



export function get_base_knowledge_view (knowledge_views: KnowledgeView[])
{
    const base_knowledge_views = knowledge_views.filter(kv => kv.is_base)

    let base_knowledge_view: KnowledgeView | undefined
    base_knowledge_view = base_knowledge_views[0]

    // (Partially) handles any bugs resulting in multiple `is_base` knowledge views being created
    if (base_knowledge_views.length > 1)
    {
        base_knowledge_views.forEach(kv =>
        {
            if (kv.created_at.getTime() < base_knowledge_view!.created_at.getTime())
            {
                base_knowledge_view = kv
            }
        })
    }

    return base_knowledge_view
}



interface KnowledgeViewWithParentId extends KnowledgeView
{
    parent_knowledge_view_id: string
}


export function get_nested_knowledge_view_ids (knowledge_views: KnowledgeView[]): NestedKnowledgeViewIds
{
    const map: NestedKnowledgeViewIds = { top_ids: [], map: {} }

    const unused_knowledge_views: KnowledgeViewWithParentId[] = []
    knowledge_views.forEach(kv =>
    {
        const { parent_knowledge_view_id, title, sort_type } = kv
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


    add_child_views(unused_knowledge_views, map)

    return map
}



function add_child_views (potential_children: KnowledgeViewWithParentId[], map: NestedKnowledgeViewIds)
{
    if (potential_children.length === 0) return


    const lack_parent: KnowledgeViewWithParentId[] = []

    potential_children.forEach(potential_child =>
    {
        const parent_kv = map.map[potential_child.parent_knowledge_view_id]
        if (parent_kv)
        {
            const { id, title, sort_type } = potential_child
            parent_kv.child_ids.push(id)

            map.map[id] = {
                id, title, sort_type, parent_id: parent_kv.id, child_ids: []
            }
        }
        else lack_parent.push(potential_child)
    })


    if (potential_children.length === lack_parent.length)
    {
        console.error(`Circular knowledge view tree`)
        lack_parent.forEach(({ id, title, sort_type }) =>
        {
            map.top_ids.push(id)
            map.map[id] = { id, title, sort_type, parent_id: undefined, child_ids: [], ERROR_is_circular: true }
        })
    }
    else
    {
        add_child_views(lack_parent, map)
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



const sort_type_to_prefix: { [sort_type in KnowledgeViewSortType]: string } = {
    priority: "0",
    normal: "1",
    hidden: "2",
    archived: "3",
}
function sort_knowledge_map_ids_by_priority_then_title (ids: string[], map: NestedKnowledgeViewIdsMap)
{
    return sort_list(ids, id =>
    {
        const entry = map[id]!
        return sort_type_to_prefix[entry.sort_type] + entry.title.toLowerCase()
    }, "ascending")
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
        // event_at = sort_list(event_at, get_created_at_ms, "descending")
        const prediction = event_at[0]
        if (!prediction) return undefined

        const temporal_uncertainty = prediction.datetime
        // Have not yet implmented setting confidence or probability of events
        const certainty = 1 // prediction.probability * prediction.conviction

        return { temporal_uncertainty, certainty }
    }

    else if (wcomponent_is_sub_state(wcomponent))
    {
        const { target_wcomponent_id, selector } = wcomponent
        const maybe_target_wcomponent = wcomponents_by_id[target_wcomponent_id || ""]
        const target_wcomponent = wcomponent_should_have_state_VAP_sets(maybe_target_wcomponent) && maybe_target_wcomponent
        if (!target_wcomponent || !selector) return undefined

        const { target_VAP_set_id } = selector
        if (!target_VAP_set_id) return undefined

        let { values_and_prediction_sets: target_VAP_sets } = target_wcomponent

        // We know that counterfactuals do not effect the time yet so we don't need to to this yet.
        // const VAP_set_id_to_counterfactual_v2_map = get_VAP_set_id_to_counterfactual_v2_map(state, target_wcomponent_id)

        target_VAP_sets = target_VAP_sets.filter(({ id }) => id === target_VAP_set_id)
        target_VAP_sets = partition_items_by_created_at_datetime({ items: target_VAP_sets, created_at_ms }).current_items
        target_VAP_sets = sort_list(target_VAP_sets, get_created_at_ms, "descending")
        const target_VAP_set = target_VAP_sets[0]
        return convert_VAP_set_to_temporal_certainty(target_VAP_set)
    }

    else if (wcomponent_is_statev2(wcomponent))
    {
        const VAP_set = wcomponent_has_single_statev2_datetime(wcomponent)
        if (VAP_set)
        {
            return convert_VAP_set_to_temporal_certainty(VAP_set)
        }
    }

    return undefined
}



export function wcomponent_has_single_statev2_datetime (wcomponent: WComponentNodeStateV2)
{

    let VAP_sets = wcomponent.values_and_prediction_sets || []
    VAP_sets = group_versions_by_id(VAP_sets).latest
        .filter(VAP_set => !uncertain_datetime_is_eternal(VAP_set.datetime))
    const VAP_set = VAP_sets[0]
    if (VAP_set && VAP_sets.length === 1)
    {
        return VAP_set
    }

    return false
}



// I do not like making up new names but I don't know what else to call this.
// It is a predictions place in time and how much certainty it reflects.
interface TemporalValueCertainty
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
