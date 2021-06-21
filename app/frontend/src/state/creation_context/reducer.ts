import type { AnyAction } from "redux"

import { update_substate, update_subsubstate } from "../../utils/update_state"
import type { RootState } from "../State"
import { is_toggle_use_creation_context, is_set_custom_created_at, is_set_label_ids } from "./actions"



export const creation_context_reducer = (state: RootState, action: AnyAction): RootState =>
{

    if (is_toggle_use_creation_context(action))
    {
        const use_creation_context = !state.creation_context.use_creation_context
        state = update_substate(state, "creation_context", "use_creation_context", use_creation_context)
    }


    let auto_set_use_to_true = false

    if (is_set_custom_created_at(action))
    {
        state = update_subsubstate(state, "creation_context", "creation_context", "custom_created_at", action.custom_created_at)
        auto_set_use_to_true = auto_set_use_to_true || !!action.custom_created_at
    }


    if (is_set_label_ids(action))
    {
        state = update_subsubstate(state, "creation_context", "creation_context", "label_ids", action.label_ids)
        auto_set_use_to_true = auto_set_use_to_true || action.label_ids.length > 0
    }


    if (auto_set_use_to_true)
    {
        state = update_substate(state, "creation_context", "use_creation_context", true)
    }


    return state
}
