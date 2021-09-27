import type { KnowledgeView } from "../../../shared/interfaces/knowledge_view"
import { update_substate } from "../../../utils/update_state"
import type { RootState } from "../../State"
import { update_specialised_object_ids_pending_save } from "../../sync/actions_reducer"
import { update_modified_by } from "../update_modified_by"



export function handle_upsert_knowledge_view (state: RootState, knowledge_view: KnowledgeView, source_of_truth?: boolean): RootState
{
    const map = { ...state.specialised_objects.knowledge_views_by_id }
    map[knowledge_view.id] = source_of_truth ? knowledge_view : update_modified_by(knowledge_view, state)

    state = update_substate(state, "specialised_objects", "knowledge_views_by_id", map)

    if (!source_of_truth)
    {
        state = update_specialised_object_ids_pending_save(state, "knowledge_view", knowledge_view.id, true)
    }

    return state
}
