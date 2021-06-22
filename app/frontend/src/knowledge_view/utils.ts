import type { UIKnowledgeView, KnowledgeView } from "../shared/wcomponent/interfaces/knowledge_view"



export function UI_knowledge_view_to_plain_kv (UI_kv: UIKnowledgeView): KnowledgeView
{
    const { children, ERROR_is_circular, ...cleaned_kv } = UI_kv
    return cleaned_kv
}
