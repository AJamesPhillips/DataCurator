import type { KnowledgeView } from "../../../shared/interfaces/knowledge_view"
import { ensure_item_in_set } from "../../../utils/set"
import { update_substate, update_subsubstate } from "../../../utils/update_state"
import type { RootState } from "../../State"
import { update_modified_by } from "../update_modified_by"



export function handle_upsert_knowledge_view (state: RootState, knowledge_view: KnowledgeView, source_of_truth?: boolean): RootState
{
    const map = { ...state.specialised_objects.knowledge_views_by_id }
    map[knowledge_view.id] = source_of_truth ? knowledge_view : update_modified_by(knowledge_view, state)

    state = update_substate(state, "specialised_objects", "knowledge_views_by_id", map)

    if (!source_of_truth)
    {
        let { knowledge_view_ids } = state.sync.specialised_objects_pending_save
        knowledge_view_ids = ensure_item_in_set(knowledge_view_ids, knowledge_view.id)
        state = update_subsubstate(state, "sync", "specialised_objects_pending_save", "knowledge_view_ids", knowledge_view_ids)
    }

    return state
}
