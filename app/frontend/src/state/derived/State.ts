import type { ProjectPrioritiesMeta } from "../../priorities/interfaces"
import type {
    KnowledgeView,
    KnowledgeViewWComponentIdEntryMap,
} from "../../shared/wcomponent/interfaces/knowledge_view"
import type {
    Perception,
    WComponent,
} from "../../shared/wcomponent/interfaces/SpecialisedObjects"
import type { WcIdCounterfactualsMap } from "../../shared/uncertainty/uncertainty"
import type { WComponentType } from "../../shared/wcomponent/interfaces/wcomponent_base"
import type { WComponentPrioritisation } from "../../shared/wcomponent/interfaces/priorities"



export interface NestedKnowledgeViewIdsEntry
{
    id: string
    title: string
    parent_id: string | undefined
    child_ids: string[]
    ERROR_is_circular?: true
}

export type NestedKnowledgeViewIdsMap = {
    top_ids: string[]
    map: { [id: string]: NestedKnowledgeViewIdsEntry }
}


export interface GraphUIKnowledgeView extends Omit<KnowledgeView, "wc_id_map">
{
    derived_wc_id_map: KnowledgeViewWComponentIdEntryMap
    wcomponent_nodes: WComponent[]
    wcomponent_connections: WComponent[]
    wc_id_counterfactuals_map: WcIdCounterfactualsMap
    wc_ids_by_type: WComponentIdsByType
    prioritisations: WComponentPrioritisation[]

    filters: {
        wc_ids_excluded_by_filters: Set<string>
    }
}


type ExtendedWComponentType = WComponentType | "judgement_or_objective" | "any_link"
export type WComponentIdsByType = { [t in ExtendedWComponentType]: Set<string> }


export interface DerivedState
{
    perceptions: Perception[]
    wcomponents: WComponent[]
    wcomponent_ids_by_type: WComponentIdsByType
    knowledge_views: KnowledgeView[]

    base_knowledge_view: KnowledgeView | undefined
    nested_knowledge_view_ids_map: NestedKnowledgeViewIdsMap

    judgement_or_objective_ids_by_target_id: { [target_wcomponent_id: string]: string[] }
    judgement_or_objective_ids_by_goal_id: { [goal_wcomponent_id: string]: string[] }

    current_UI_knowledge_view: GraphUIKnowledgeView | undefined

    project_priorities_meta: ProjectPrioritiesMeta
}
