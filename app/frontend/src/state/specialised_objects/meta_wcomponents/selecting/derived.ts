import { is_wcomponent_id } from "../../../../shared/utils/ids"
import { update_substate } from "../../../../utils/update_state"
import type { RootState } from "../../../State"



export function derived_meta_wcomponents_state_reducer (initial_state: RootState, state: RootState)
{
    state = handle_route_changed(initial_state, state)

    return state
}



function handle_route_changed (initial_state: RootState, state: RootState)
{
    // TODO refactor as checking if not wcomponents_edit_multiple seems too complected / brittle.
    if (initial_state.routing.item_id !== state.routing.item_id && state.routing.sub_route !== "wcomponents_edit_multiple")
    {
        const selected_wcomponent_ids = new Set<string>()
        if (state.routing.item_id && is_wcomponent_id(state.routing.item_id))
        {
            selected_wcomponent_ids.add(state.routing.item_id)
        }

        state = update_substate(state, "meta_wcomponents", "selected_wcomponent_ids", selected_wcomponent_ids)
    }

    return state
}
