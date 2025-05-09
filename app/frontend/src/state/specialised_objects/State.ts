import type { KnowledgeViewsById } from "../../shared/interfaces/knowledge_view"
import type {
    WComponentsById,
} from "../../wcomponent/interfaces/SpecialisedObjects"



export interface SpecialisedObjectsState
{
    wcomponents_by_id: WComponentsById
    knowledge_views_by_id: KnowledgeViewsById
}
