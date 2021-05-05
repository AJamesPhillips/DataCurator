import type {
    KnowledgeView,
    KnowledgeViewWComponentIdEntryMap,
    Perception,
    WComponent,
} from "../../shared/models/interfaces/SpecialisedObjects"
import type { WComponentType } from "../../shared/models/interfaces/wcomponent"



export type WcIdCounterfactualsMap = {
    [target_wcomponent_id: string]: {
        VAP_set: {
            [target_VAP_set_id: string]: {
                [target_VAP_id: string]: string // string is the id of the counterfactual wcomponent
            }
        }
    }
}

export interface DerivedUIKnowledgeView extends Omit<KnowledgeView, "wc_id_map">
{
    derived_wc_id_map: KnowledgeViewWComponentIdEntryMap
    wc_id_counterfactuals_map: WcIdCounterfactualsMap
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
