import type { KnowledgeView } from "../../shared/interfaces/knowledge_view"
import type { WComponent } from "../../shared/wcomponent/interfaces/SpecialisedObjects"
import type { RootState } from "../State"



export function get_last_source_of_truth_wcomponent_from_state (state: RootState, id: string | null): WComponent | undefined
{
    return state.sync.last_source_of_truth_specialised_objects_by_id.wcomponents[id || ""]
}



export function get_last_source_of_truth_knowledge_view_from_state (state: RootState, id: string | null): KnowledgeView | undefined
{
    return state.sync.last_source_of_truth_specialised_objects_by_id.knowledge_views[id || ""]
}
