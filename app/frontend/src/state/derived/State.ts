import type { ProjectPrioritiesMeta } from "../../priorities/interfaces"
import type {
    KnowledgeView,
    KnowledgeViewWComponentIdEntryMap,
} from "../../shared/wcomponent/interfaces/knowledge_view"
import type {
    Perception,
    WComponent,
} from "../../shared/wcomponent/interfaces/SpecialisedObjects"
import type { WcIdCounterfactualsMap } from "../../shared/wcomponent/interfaces/uncertainty/uncertainty"
import type { WComponentType } from "../../shared/wcomponent/interfaces/wcomponent_base"


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
