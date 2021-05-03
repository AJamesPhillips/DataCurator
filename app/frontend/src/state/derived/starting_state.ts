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
            actor: new Set(),
            causal_link: new Set(),
            relation_link: new Set(),
            judgement: new Set(),
        },
        knowledge_views: [],

        base_knowledge_view: undefined,
        other_knowledge_views: [],
        judgement_ids_by_target_id: {},
    }
}
