import type { Perception, WComponent } from "../../shared/wcomponent/interfaces/SpecialisedObjects"
import type { KnowledgeView, UIKnowledgeView } from "../../shared/wcomponent/interfaces/knowledge_view"
import { sort_list } from "../../shared/utils/sort"
import type { RootState } from "../State"



export function get_wcomponent_from_state (state: RootState, id: string | null): WComponent | undefined
{
    return id ? state.specialised_objects.wcomponents_by_id[id] : undefined
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



interface UIKnowledgeViewWithParentId extends UIKnowledgeView
{
    parent_knowledge_view_id: string
}


export function get_UI_knowledge_views (knowledge_views: KnowledgeView[]): UIKnowledgeView[]
{
    const unsorted_top_level_knowledge_views: UIKnowledgeView[] = []
    const unused_knowledge_views: UIKnowledgeViewWithParentId[] = []
    knowledge_views.forEach(kv =>
    {
        const { parent_knowledge_view_id } = kv
        if (parent_knowledge_view_id)
        {
            unused_knowledge_views.push({ ...kv, children: [], parent_knowledge_view_id })
        }
        else unsorted_top_level_knowledge_views.push({ ...kv, children: [] })
    })

    const sorted_top_level_knowledge_views = sort_list(unsorted_top_level_knowledge_views, ({ title }) => title.toLowerCase(), "ascending")

    const ERROR_circular_knowledge_views = add_child_views(sorted_top_level_knowledge_views, unused_knowledge_views)
    const top_level_kvs = [...sorted_top_level_knowledge_views, ...ERROR_circular_knowledge_views]

    return top_level_kvs
}



function add_child_views (parent_knowledge_views: UIKnowledgeView[], potential_children: UIKnowledgeViewWithParentId[])
{
    const kv_id_map: { [id: string]: UIKnowledgeView } = {}
    parent_knowledge_views.forEach(kv => kv_id_map[kv.id] = kv)
    const new_potential_parents: UIKnowledgeViewWithParentId[] = []
    const lack_parent: UIKnowledgeViewWithParentId[] = []

    potential_children.forEach(potential_child =>
    {
        const parent_kv = kv_id_map[potential_child.parent_knowledge_view_id]
        if (parent_kv)
        {
            parent_kv.children.push(potential_child)
            new_potential_parents.push(potential_child)
        }
        else lack_parent.push(potential_child)
    })


    let ERROR_circular_knowledge_views: UIKnowledgeView[] = []
    if (new_potential_parents.length > 0)
    {
        ERROR_circular_knowledge_views = add_child_views(new_potential_parents, lack_parent)
    }
    else if (lack_parent.length > 0)
    {
        console.error(`Circular knowledge view tree`)
        ERROR_circular_knowledge_views = lack_parent.map(kv => ({ ...kv, ERROR_is_circular: true }))
    }

    return ERROR_circular_knowledge_views
}
