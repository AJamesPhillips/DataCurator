import { update_substate } from "../../utils/update_state"
import type { RootState } from "../State"



export function derived_filter_context_state_reducer (initial_state: RootState, state: RootState)
{
    state = update_force_display(initial_state, state)

    return state
}



function update_force_display (initial_state: RootState, state: RootState)
{
    const force_display = state.user_activity.is_editing_text ? false : state.global_keys.keys_down.has("Shift")

    if (initial_state.filter_context.force_display !== force_display)
    {
        state = update_substate(state, "filter_context", "force_display", force_display)
    }

    return state
}
