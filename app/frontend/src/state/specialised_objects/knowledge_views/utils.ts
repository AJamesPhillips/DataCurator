import type { KnowledgeView } from "../../../shared/interfaces/knowledge_view"
import { update_substate } from "../../../utils/update_state"
import type { RootState } from "../../State"
import { update_specialised_object_ids_pending_save } from "../../sync/utils"
import { update_modified_by } from "../update_modified_by"



export function handle_upsert_knowledge_view (state: RootState, knowledge_view: KnowledgeView, is_source_of_truth?: boolean): RootState
{
    // Defensive.  Extra check in case editing is attempted from a different base.
    // Not 100% sure we need to prevent editing from a different base but this approach
    // allows for a simplier approach in the code, UX & UI to be taken for now.
    if (state.user_info.chosen_base_id !== knowledge_view.base_id)
    {
        console.error(`Trying to save knowledge_view "${knowledge_view.id}" but its base_id "${knowledge_view.base_id}" || ${state.user_info.chosen_base_id}`)
        return state
    }

    const map = { ...state.specialised_objects.knowledge_views_by_id }
    knowledge_view = is_source_of_truth ? knowledge_view : update_modified_by(knowledge_view, state)
    map[knowledge_view.id] = knowledge_view

    state = update_substate(state, "specialised_objects", "knowledge_views_by_id", map)

    // Set derived data
    state = update_specialised_object_ids_pending_save(
        state, "knowledge_view", knowledge_view.id,
        // Can replace `!!knowledge_view.needs_save` with `!is_source_of_truth`?
        !!knowledge_view.needs_save)

    return state
}
