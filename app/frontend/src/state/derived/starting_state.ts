import { get_empty_wcomponent_ids_by_type } from "./get_wcomponent_ids_by_type"
import type { DerivedState } from "./State"



export function get_derived_starting_state (): DerivedState
{
    return {
        perceptions: [],
        wcomponents: [],
        wcomponent_ids_by_type: get_empty_wcomponent_ids_by_type(),
        knowledge_views: [],

        base_knowledge_view: undefined,
        other_knowledge_views: [],
        judgement_ids_by_target_id: {},
        judgement_ids_by_goal_id: {},

        current_UI_knowledge_view: undefined,

        project_priorities_meta: {
            project_priorities: [],
            priorities_by_project: {},
            project_id_to_vertical_position: {},
            project_priority_events: [],
            earliest_ms: 0,
            latest_ms: 0,
        },
    }
}
