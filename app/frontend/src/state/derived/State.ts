import type { ProjectPrioritiesMeta } from "../../priorities/interfaces"
import type {
    KnowledgeView,
    KnowledgeViewSortType,
    KnowledgeViewWComponentIdEntryMap,
} from "../../shared/interfaces/knowledge_view"
import type {
    Perception,
    WComponent,
} from "../../wcomponent/interfaces/SpecialisedObjects"
import type { WComponentType } from "../../wcomponent/interfaces/wcomponent_base"
import type { WComponentPrioritisation } from "../../wcomponent/interfaces/priorities"
import type { WcIdToCounterfactualsV2Map } from "../../wcomponent_derived/interfaces/counterfactual"
import type { OverlappingWcIdMap } from "../../wcomponent_derived/interfaces/canvas"
import type { ComposedDatetimeLineConfig } from "../../shared/interfaces/datetime_lines"



export interface NestedKnowledgeViewIdsEntry
{
    id: string
    title: string
    sort_type: KnowledgeViewSortType
    parent_id: string | undefined
    child_ids: string[]
    ERROR_is_circular?: true
}

export interface NestedKnowledgeViewIdsMap
{
    [id: string]: NestedKnowledgeViewIdsEntry
}

export type NestedKnowledgeViewIds = {
    top_ids: string[]
    map: NestedKnowledgeViewIdsMap
}


export interface ComposedKnowledgeView extends Omit<Omit<KnowledgeView, "wc_id_map">, "datetime_line_config">
{
    composed_wc_id_map: KnowledgeViewWComponentIdEntryMap
    overlapping_wc_ids: OverlappingWcIdMap
    wcomponent_nodes: WComponent[]
    wcomponent_connections: WComponent[]
    wc_id_to_counterfactuals_v2_map: WcIdToCounterfactualsV2Map
    wc_id_to_active_counterfactuals_v2_map: WcIdToCounterfactualsV2Map
    wc_ids_by_type: WComponentIdsByType
    prioritisations: WComponentPrioritisation[]

    composed_datetime_line_config: ComposedDatetimeLineConfig

    filters: {
        wc_ids_excluded_by_filters: Set<string>
    }
}


type ExtendedWComponentType = WComponentType | "judgement_or_objective" | "any_link" | "any_node" | "any_state_VAPs" | "has_single_datetime"
export type WComponentIdsByType = { [t in ExtendedWComponentType]: Set<string> }


export interface DerivedState
{
    perceptions: Perception[]
    wcomponents: WComponent[]
    wcomponent_ids_by_type: WComponentIdsByType
    knowledge_views: KnowledgeView[]

    base_knowledge_view: KnowledgeView | undefined
    nested_knowledge_view_ids: NestedKnowledgeViewIds

    judgement_or_objective_ids_by_target_id: { [target_wcomponent_id: string]: string[] }
    judgement_or_objective_ids_by_goal_id: { [goal_wcomponent_id: string]: string[] }

    current_composed_knowledge_view: ComposedKnowledgeView | undefined

    project_priorities_meta: ProjectPrioritiesMeta
}
