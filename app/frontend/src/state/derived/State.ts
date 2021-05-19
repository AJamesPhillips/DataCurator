import type { ProjectPrioritiesMeta } from "../../priorities/interfaces"
import type {
    KnowledgeView,
    KnowledgeViewWComponentIdEntryMap,
    Perception,
    WComponent,
} from "../../shared/models/interfaces/SpecialisedObjects"
import type { WComponentCounterfactual } from "../../shared/models/interfaces/uncertainty"
import type { WComponentType } from "../../shared/models/interfaces/wcomponent"



export interface VAP_id_counterfactual_map
{
    [target_VAP_id: string]: WComponentCounterfactual
}
export interface VAP_set_id_counterfactual_map
{
    [target_VAP_set_id: string]: VAP_id_counterfactual_map
}
export interface WComponentCounterfactuals
{
    VAP_set: VAP_set_id_counterfactual_map
}
export type WcIdCounterfactualsMap = {
    [target_wcomponent_id: string]: WComponentCounterfactuals
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

    project_priorities_meta: ProjectPrioritiesMeta
}
