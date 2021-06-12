import type { DerivedState } from "./State"



export function get_derived_starting_state (): DerivedState
{
    return {
        perceptions: [],
        wcomponents: [],
        wcomponent_ids_by_type: {
            event: new Set(),
            state: new Set(),
            statev2: new Set(),
            process: new Set(),
            action: new Set(),
            actor: new Set(),
            causal_link: new Set(),
            relation_link: new Set(),
            judgement: new Set(),
            objective: new Set(),
            counterfactual: new Set(),
            goal: new Set(),
            prioritisation: new Set(),
        },
        knowledge_views: [],

        base_knowledge_view: undefined,
        other_knowledge_views: [],
        judgement_ids_by_target_id: {},

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
