import type { Perception, WComponent, WComponentsById } from "../../shared/wcomponent/interfaces/SpecialisedObjects"
import type { KnowledgeView, KnowledgeViewSortType } from "../../shared/wcomponent/interfaces/knowledge_view"
import type { RootState } from "../State"
import type { NestedKnowledgeViewIds } from "../derived/State"
import { sort_list } from "../../shared/utils/sort"



export function get_wcomponent_from_state (state: RootState, id: string | null): WComponent | undefined
{
    return id ? state.specialised_objects.wcomponents_by_id[id] : undefined
}


export function get_wcomponents_id_map (wcomponents_by_id: WComponentsById, ids: string[] | Set<string> | undefined): (WComponent | undefined)[]
{
    ids = ids || []
    ids = ids instanceof Set ? Array.from(ids): ids

    return ids.map(id => id ? wcomponents_by_id[id] : undefined)
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


export function get_current_UI_knowledge_view_from_state (state: RootState)
{
    return state.derived.current_UI_knowledge_view
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
    const sort_type_to_prefix: { [sort_type in KnowledgeViewSortType]: string } = {
        priority: "0",
        normal: "1",
        hidden: "2",
        archived: "3",
    }

    map.top_ids = sort_list(map.top_ids, id =>
    {
        const entry = map.map[id]!
        return sort_type_to_prefix[entry.sort_type] + entry.title.toLowerCase()
    }, "ascending")

    Object.values(map.map).forEach(entry =>
    {
        entry.child_ids = sort_list(entry.child_ids, id => map.map[id]!.title.toLowerCase(), "ascending")
    })
}
