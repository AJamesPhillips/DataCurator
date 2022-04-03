import type {
    WComponentsById,
} from "../../wcomponent/interfaces/SpecialisedObjects"
import type { KnowledgeViewsById } from "../../shared/interfaces/knowledge_view"



export interface SpecialisedObjectsState
{
    wcomponents_by_id: WComponentsById
    knowledge_views_by_id: KnowledgeViewsById
}
