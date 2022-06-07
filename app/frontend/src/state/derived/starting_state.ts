import { get_empty_wcomponent_ids_by_type } from "./get_wcomponent_ids_by_type"
import type { DerivedState } from "./State"



export function get_derived_starting_state (): DerivedState
{
    return {
        composed_wcomponents_by_id: {},
        wcomponent_ids_by_type: get_empty_wcomponent_ids_by_type(),
        knowledge_views: [],

        nested_knowledge_views: { top_ids: [], map: {} },

        judgement_or_objective_ids_by_target_id: {},
        judgement_or_objective_ids_by_goal_or_action_id: {},

        current_composed_knowledge_view: undefined,
    }
}
