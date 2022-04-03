import type { SpecialisedObjectsState } from "./State"



export function get_specialised_objects_starting_state (): SpecialisedObjectsState
{
    return {
        wcomponents_by_id: {},
        knowledge_views_by_id: {},
    }
}
