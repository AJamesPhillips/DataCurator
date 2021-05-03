import type {
    KnowledgeView,
    KnowledgeViewsById,
    Perception,
    WComponent,
    WComponentsById,
    WComponentType,
} from "../../shared/models/interfaces/SpecialisedObjects"



export interface SpecialisedObjectsCoreState
{
    perceptions_by_id: { [id: string]: Perception }
    wcomponents_by_id: WComponentsById
    knowledge_views_by_id: KnowledgeViewsById
}



export interface SpecialisedObjectsState extends SpecialisedObjectsCoreState
{
    // Dervied state
    perceptions: Perception[]
    wcomponents: WComponent[]
    wcomponent_ids_by_type: { [t in WComponentType]: Set<string> }
    knowledge_views: KnowledgeView[]

    // // predictions: Prediction[]
    // objectives: Objective[]
    // plans: Plan[]
    // priorities: Priority[]
    // actions: Action[]
}
