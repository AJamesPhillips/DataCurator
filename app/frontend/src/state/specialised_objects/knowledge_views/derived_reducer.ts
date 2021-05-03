
import { sort_list } from "../../../shared/utils/sort"
import { update_substate } from "../../../utils/update_state"
import type { RootState } from "../../State"
import { get_base_knowledge_view } from "../accessors"



export const knowledge_views_derived_reducer = (initial_state: RootState, state: RootState): RootState =>
{

    if (initial_state.specialised_objects.knowledge_views_by_id !== state.specialised_objects.knowledge_views_by_id)
    {
        state = update_derived_knowledge_view_state(state)
    }


    return state
}



function update_derived_knowledge_view_state (state: RootState): RootState
{
    const knowledge_views = sort_list(
        Object.values(state.specialised_objects.knowledge_views_by_id),
        ({ created_at }) => created_at.getTime(),
        "ascending"
    )
    state = update_substate(state, "derived", "knowledge_views", knowledge_views)


    const {
        base_knowledge_view,
        other_knowledge_views,
    } = get_base_knowledge_view(state)

    state = {
        ...state,
        derived: {
            ...state.derived,
            base_knowledge_view,
            other_knowledge_views,
        },
    }

    return state
}
