import type { KnowledgeView } from "../interfaces/knowledge_view"



export function parse_knowledge_view (knowledge_view: KnowledgeView): KnowledgeView
{
    knowledge_view = {
        ...knowledge_view,
        created_at: new Date(knowledge_view.created_at),
    }

    return upgrade_2021_05_24_knowledge_view(knowledge_view)
}


function upgrade_2021_05_24_knowledge_view (knowledge_view: KnowledgeView): KnowledgeView
{
    // data migrate to ensure goal_ids array is always present
    // TODO remove once MVP1.0
    const goal_ids = knowledge_view.goal_ids || []
    return { ...knowledge_view, goal_ids }
}
