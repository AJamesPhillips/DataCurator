import type { KnowledgeView } from "../../../shared/wcomponent/interfaces/knowledge_view"
import { update_substate } from "../../../utils/update_state"
import type { RootState } from "../../State"
import { mark_as_modified } from "../mark_as_modified"



export function handle_upsert_knowledge_view (state: RootState, knowledge_view: KnowledgeView): RootState
{
    const map = { ...state.specialised_objects.knowledge_views_by_id }
    map[knowledge_view.id] = mark_as_modified(knowledge_view, state)

    return update_substate(state, "specialised_objects", "knowledge_views_by_id", map)
}
