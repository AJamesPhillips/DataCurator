import type { KnowledgeViewsById } from "../../shared/interfaces/knowledge_view"
import { WComponentsById, wcomponent_is_action } from "../../wcomponent/interfaces/SpecialisedObjects"



export function get_default_parent_action_ids (knowledge_view_id: string | undefined, knowledge_views_by_id: KnowledgeViewsById, wcomponents_by_id: WComponentsById)
{
    let kv = knowledge_view_id ? knowledge_views_by_id[knowledge_view_id] : undefined

    while (kv)
    {
        const wc = wcomponents_by_id[kv.id]
        if (wcomponent_is_action(wc)) return [wc.id]
        kv = kv.parent_knowledge_view_id ? knowledge_views_by_id[kv.parent_knowledge_view_id] : undefined
    }

    return []
}
