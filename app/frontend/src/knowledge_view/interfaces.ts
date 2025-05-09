import type {
    KnowledgeView,
    KnowledgeViewsById,
    KnowledgeViewTreeSortType,
} from "../shared/interfaces/knowledge_view"
import type { CreationContextState } from "../state/creation_context/state"
import type { NestedKnowledgeViewIds } from "../state/derived/State"
import type { ViewType } from "../state/routing/interfaces"
import type { SupabaseKnowledgeBaseWithAccess } from "../supabase/interfaces"
import type { WComponentsById } from "../wcomponent/interfaces/SpecialisedObjects"



export interface KnowledgeViewFormProps
{
    possible_parent_knowledge_view_ids: string[]
    nested_knowledge_view_ids: NestedKnowledgeViewIds
    knowledge_views_by_id: KnowledgeViewsById
    creation_context: CreationContextState | undefined
    current_view: ViewType
    current_subview_id: string
    current_kv_parent_ids: Set<string>
    // Only needs to calculate has_wcomponent but software pattern for lists is inadequate to
    // easily accommodate this
    wcomponents_by_id: WComponentsById
    editing: boolean
    upsert_knowledge_view: (args: { knowledge_view: KnowledgeView }) => void

    chosen_base_id: number | undefined
    bases_by_id: { [base_id: string]: SupabaseKnowledgeBaseWithAccess } | undefined
    update_chosen_base_id: (args: { base_id: number | undefined }) => void
}



export interface KnowledgeViewListCoreProps extends KnowledgeViewFormProps
{
    parent_knowledge_view_id?: string
    item_descriptor?: string
    knowledge_views: KnowledgeView[]
}



export interface KnowledgeViewListProps extends KnowledgeViewListCoreProps
{
    sort_type: KnowledgeViewTreeSortType
}
