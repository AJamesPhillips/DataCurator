import { get_empty_wcomponent_ids_by_type } from "./get_wcomponent_ids_by_type"
import type { DerivedState } from "./State"



export function get_derived_starting_state (): DerivedState
{
    return {
        composed_wcomponents_by_id: {},
        wcomponent_ids_by_type: get_empty_wcomponent_ids_by_type(),
        knowledge_views: [],

        nested_knowledge_view_ids: { top_ids: [], map: {} },

        current_composed_knowledge_view: undefined,
    }
}
