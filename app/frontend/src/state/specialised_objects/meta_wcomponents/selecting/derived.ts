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
    if (initial_state.routing.item_id !== state.routing.item_id)
    {
        if (state.routing.item_id && is_wcomponent_id(state.routing.item_id))
        {
            const selected_wcomponent_ids = new Set([ state.routing.item_id ])
            state = update_substate(state, "meta_wcomponents", "selected_wcomponent_ids", selected_wcomponent_ids)
        }
    }

    return state
}
