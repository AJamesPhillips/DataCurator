import type { Perception, WComponent } from "../../shared/wcomponent/interfaces/SpecialisedObjects"
import type { KnowledgeView } from "../../shared/wcomponent/interfaces/knowledge_view"
import { sort_list } from "../../shared/utils/sort"
import type { RootState } from "../State"



export function get_wcomponent_from_state (state: RootState, id: string | null): WComponent | undefined
{
    return id ? state.specialised_objects.wcomponents_by_id[id] : undefined
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



interface GetBaseKnowledgeViewReturn
{
    base_knowledge_view: KnowledgeView | undefined
    other_knowledge_views: KnowledgeView[]
}
export function get_base_knowledge_view (state: RootState): GetBaseKnowledgeViewReturn
{
    const knowledge_views = state.derived.knowledge_views
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

    const unsorted_other_knowledge_views = knowledge_views.filter(kv => !base_knowledge_view || kv.id !== base_knowledge_view.id)
    const other_knowledge_views = sort_list(unsorted_other_knowledge_views, ({ created_at }) => created_at.getTime(), "descending")

    return {
        base_knowledge_view,
        other_knowledge_views,
    }
}
