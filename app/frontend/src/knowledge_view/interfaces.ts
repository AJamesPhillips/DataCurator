import type { CreationContextState } from "../shared/creation_context/state"
import type { KnowledgeView, KnowledgeViewsById } from "../shared/wcomponent/interfaces/knowledge_view"
import type { NestedKnowledgeViewIds } from "../state/derived/State"
import type { ViewType } from "../state/routing/interfaces"



export interface KnowledgeViewListCoreProps
{
    item_descriptor?: string
    parent_knowledge_view_id?: string
    possible_parent_knowledge_view_options: { id: string, title: string }[]
    knowledge_views: KnowledgeView[]
    nested_knowledge_view_ids: NestedKnowledgeViewIds
    knowledge_views_by_id: KnowledgeViewsById
    creation_context: CreationContextState
    current_view: ViewType
    current_kv_parent_ids: Set<string>
    editing: boolean
    upsert_knowledge_view: (knowledge_view: KnowledgeView) => void
}
