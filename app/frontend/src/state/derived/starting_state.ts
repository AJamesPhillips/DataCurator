import type { DerivedState } from "./State"



export function get_derived_starting_state (): DerivedState
{
    return {
        base_knowledge_view: undefined,
        other_knowledge_views: [],
        judgement_ids_by_target_id: {},
    }
}
