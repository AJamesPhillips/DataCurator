import type {
    Perception,
    WComponentsById,
} from "../../shared/wcomponent/interfaces/SpecialisedObjects"
import type { KnowledgeViewsById } from "../../shared/wcomponent/interfaces/knowledge_view"



export interface SpecialisedObjectsState
{
    perceptions_by_id: { [id: string]: Perception /*| undefined*/ }
    wcomponents_by_id: WComponentsById
    knowledge_views_by_id: KnowledgeViewsById
}
