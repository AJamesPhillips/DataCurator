import type { ComposedDatetimeLineConfig } from "../../shared/interfaces/datetime_lines"
import type {
    KnowledgeView,
    KnowledgeViewTreeSortType,
    KnowledgeViewWComponentIdEntryMap,
} from "../../shared/interfaces/knowledge_view"
import type { WComponentPrioritisation } from "../../wcomponent/interfaces/priorities"
import type {
    WComponent, WComponentsById,
} from "../../wcomponent/interfaces/SpecialisedObjects"
import type { WComponentType } from "../../wcomponent/interfaces/wcomponent_base"
import type { OverlappingWcIdMap } from "../../wcomponent_derived/interfaces/canvas"
import type { WcIdToCounterfactualsV2Map } from "../../wcomponent_derived/interfaces/counterfactual"
import { DerivedAvailableFilterOptions } from "../filter_context/utils"



export interface NestedKnowledgeViewIdsEntry
{
    id: string
    title: string
    sort_type: KnowledgeViewTreeSortType
    parent_id: string | undefined
    child_ids: string[]
    ERROR_is_circular?: boolean
    ERROR_parent_kv_missing?: boolean
    ERROR_parent_from_diff_base?: boolean
}

export interface NestedKnowledgeViewIdsMap
{
    [id: string]: NestedKnowledgeViewIdsEntry
}

export type NestedKnowledgeViewIds = {
    top_ids: string[]
    map: NestedKnowledgeViewIdsMap
}


export interface ComposedKnowledgeView extends Omit<KnowledgeView, "wc_id_map" | "datetime_line_config">
{
    // Should contain all kv entries where:
    //   .blocked === (false or undefined) and
    //   .passthrough === (false or undefined) and
    //   .deleted === undefined
    composed_wc_id_map: KnowledgeViewWComponentIdEntryMap
    // Is the composed_wc_id_map with filters applied for label, component type and created_at
    composed_visible_wc_id_map: KnowledgeViewWComponentIdEntryMap
    // Should contain all kv entries where .blocked === true
    composed_blocked_wc_id_map: KnowledgeViewWComponentIdEntryMap

    overlapping_wc_ids: OverlappingWcIdMap
    wcomponent_nodes: WComponent[]
    wcomponent_connections: WComponent[]
    wcomponent_unfound_ids: string[]

    wc_id_to_active_counterfactuals_v2_map: WcIdToCounterfactualsV2Map
    wc_ids_by_type: WComponentIdsByType
    prioritisations: WComponentPrioritisation[]

    wc_id_connections_map: {[wc_id: string]: Set<string>}
    active_judgement_or_objective_ids_by_target_id: { [target_wcomponent_id: string]: string[] }
    active_judgement_or_objective_ids_by_goal_or_action_id: { [target_wcomponent_id: string]: string[] }


    composed_datetime_line_config: ComposedDatetimeLineConfig

    available_filter_options: DerivedAvailableFilterOptions

    filters: {
        wc_ids_excluded_by_any_filter: Set<string>

        wc_ids_excluded_by_filters: Set<string>
        wc_ids_excluded_by_created_at_datetime_filter: Set<string>
        vap_set_number_excluded_by_created_at_datetime_filter: number
    }
}


type ExtendedWComponentType = WComponentType | "judgement_or_objective" | "goal_or_action" | "has_objectives" | "any_link" | "any_node" | "any_state_VAPs" | "has_single_datetime"
export type WComponentIdsByType = { [t in ExtendedWComponentType]: Set<string> }



export interface DerivedState
{
    // MUST NOT save these to the server as the `State` type wcomponents may contain VAP sets from
    // other `State value` type wcomponents
    composed_wcomponents_by_id: WComponentsById

    // Does not include deleted components
    wcomponent_ids_by_type: WComponentIdsByType
    knowledge_views: KnowledgeView[]

    nested_knowledge_view_ids: NestedKnowledgeViewIds

    judgement_or_objective_ids_by_target_id: { [target_wcomponent_id: string]: string[] }
    judgement_or_objective_ids_by_goal_or_action_id: { [goal_wcomponent_id: string]: string[] }

    current_composed_knowledge_view: ComposedKnowledgeView | undefined
}
