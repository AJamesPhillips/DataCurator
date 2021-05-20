import type { AnyAction } from "redux"

import { update_substate, update_subsubstate } from "../../utils/update_state"
import type { RootState } from "../State"
import { is_toggle_use_creation_context, is_set_custom_created_at } from "./actions"



export const creation_context_reducer = (state: RootState, action: AnyAction): RootState =>
{

    if (is_toggle_use_creation_context(action))
    {
        const use_creation_context = !state.creation_context.use_creation_context
        state = update_substate(state, "creation_context", "use_creation_context", use_creation_context)
    }


    if (is_set_custom_created_at(action))
    {
        state = update_subsubstate(state, "creation_context", "creation_context", "custom_created_at", action.custom_created_at)
    }


    return state
}
