import type { KnowledgeView, Perception, WComponent, WComponentType } from "../../shared/models/interfaces/SpecialisedObjects"



export interface DerivedState
{
    perceptions: Perception[]
    wcomponents: WComponent[]
    wcomponent_ids_by_type: { [t in WComponentType]: Set<string> }
    knowledge_views: KnowledgeView[]

    base_knowledge_view: KnowledgeView | undefined
    other_knowledge_views: KnowledgeView[]
    judgement_ids_by_target_id: { [target_wcomponent_id: string]: string[] }
}
