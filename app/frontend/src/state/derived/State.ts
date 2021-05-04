import type {
    KnowledgeView,
    KnowledgeViewWComponentIdEntryMap,
    Perception,
    WComponent,
    WComponentType,
} from "../../shared/models/interfaces/SpecialisedObjects"



export interface DerivedUIKnowledgeView extends Omit<KnowledgeView, "wc_id_map">
{
    derived_wc_id_map: KnowledgeViewWComponentIdEntryMap
}


export type WComponentIdsByType = { [t in WComponentType]: Set<string> }


export interface DerivedState
{
    perceptions: Perception[]
    wcomponents: WComponent[]
    wcomponent_ids_by_type: WComponentIdsByType
    knowledge_views: KnowledgeView[]

    base_knowledge_view: KnowledgeView | undefined
    other_knowledge_views: KnowledgeView[]
    judgement_ids_by_target_id: { [target_wcomponent_id: string]: string[] }

    current_UI_knowledge_view: DerivedUIKnowledgeView | undefined
}
