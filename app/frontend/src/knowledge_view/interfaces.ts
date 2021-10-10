import type { CreationContextState } from "../state/creation_context/state"
import type { KnowledgeView, KnowledgeViewsById, KnowledgeViewSortType } from "../shared/interfaces/knowledge_view"
import type { NestedKnowledgeViewIds } from "../state/derived/State"
import type { ViewType } from "../state/routing/interfaces"



export interface KnowledgeViewFormProps
{
    possible_parent_knowledge_view_options: { id: string, title: string }[]
    nested_knowledge_view_ids: NestedKnowledgeViewIds
    knowledge_views_by_id: KnowledgeViewsById
    creation_context: CreationContextState | undefined
    current_view: ViewType
    current_subview_id: string
    current_kv_parent_ids: Set<string>
    editing: boolean
    upsert_knowledge_view: (args: { knowledge_view: KnowledgeView }) => void
}



export interface KnowledgeViewListCoreProps extends KnowledgeViewFormProps
{
    parent_knowledge_view_id?: string
    item_descriptor?: string
    knowledge_views: KnowledgeView[]
}



export interface KnowledgeViewListProps extends KnowledgeViewListCoreProps
{
    sort_type: KnowledgeViewSortType
}
