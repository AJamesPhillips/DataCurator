import type { KnowledgeView } from "../../../shared/models/interfaces/SpecialisedObjects"
import { update_substate } from "../../../utils/update_state"
import type { RootState } from "../../State"



export function handle_upsert_knowledge_view (state: RootState, knowledge_view: KnowledgeView): RootState
{
    const map = { ...state.specialised_objects.knowledge_views_by_id }
    map[knowledge_view.id] = knowledge_view

    return update_substate(state, "specialised_objects", "knowledge_views_by_id", map)
}
