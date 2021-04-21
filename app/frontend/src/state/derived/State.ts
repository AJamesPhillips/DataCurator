import type { KnowledgeView } from "../../shared/models/interfaces/SpecialisedObjects"



export interface DerivedState
{
    base_knowledge_view: KnowledgeView | undefined
    other_knowledge_views: KnowledgeView[]
    judgement_ids_by_target_id: { [target_wcomponent_id: string]: string[] }
}
