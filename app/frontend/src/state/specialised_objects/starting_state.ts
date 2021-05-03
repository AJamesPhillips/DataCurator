import type { SpecialisedObjectsState } from "./State"



export function get_specialised_objects_starting_state (): SpecialisedObjectsState
{
    return {
        perceptions_by_id: {},
        wcomponents_by_id: {},
        knowledge_views_by_id: {},
        // derived
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
        // predictions: [],
    }
}
