import { update_substate } from "../../utils/update_state"
import type { RootState } from "../State"
import { derived_composed_wcomponents_by_id_reducer } from "./derived_composed_wcomponents_by_id_reducer"
import { get_wcomponent_ids_by_type } from "./get_wcomponent_ids_by_type"
import { knowledge_views_derived_reducer } from "./knowledge_views/knowledge_views_derived_reducer"



export function derived_state_reducer (prev_state: RootState, state: RootState)
{

    if (prev_state.specialised_objects.wcomponents_by_id !== state.specialised_objects.wcomponents_by_id)
    {
        const ids = Object.keys(state.specialised_objects.wcomponents_by_id)
        const wcomponent_ids_by_type = get_wcomponent_ids_by_type(state.specialised_objects.wcomponents_by_id, ids)
        state = update_substate(state, "derived", "wcomponent_ids_by_type", wcomponent_ids_by_type)
    }


    state = knowledge_views_derived_reducer(prev_state, state)
    // TODO: add a test for this:
    // IMPORTANT: derived_composed_wcomponents_by_id_reducer MUST go after knowledge_views_derived_reducer as it
    // uses the `state.derived.current_composed_knowledge_view.composed_wc_id_map` value
    state = derived_composed_wcomponents_by_id_reducer(prev_state, state)


    return state
}
