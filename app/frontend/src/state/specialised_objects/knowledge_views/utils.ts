import type { KnowledgeView } from "../../../shared/wcomponent/interfaces/knowledge_view"
import { update_substate } from "../../../utils/update_state"
import type { RootState } from "../../State"
import { update_modified_by } from "../update_modified_by"



export function handle_upsert_knowledge_view (state: RootState, knowledge_view: KnowledgeView, source_of_truth?: boolean): RootState
{
    const map = { ...state.specialised_objects.knowledge_views_by_id }
    map[knowledge_view.id] = source_of_truth ? knowledge_view : update_modified_by(knowledge_view, state)

    return update_substate(state, "specialised_objects", "knowledge_views_by_id", map)
}
