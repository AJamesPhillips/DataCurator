import type { AnyAction } from "redux"

import type { CreationContext } from "../../creation_context/interfaces"
import { update_substate } from "../../utils/update_state"
import type { RootState } from "../State"
import { is_set_label_ids, is_set_replace_text, is_toggle_use_creation_context } from "./actions"



export const creation_context_reducer = (state: RootState, action: AnyAction): RootState =>
{

    if (is_toggle_use_creation_context(action))
    {
        const use_creation_context = !state.creation_context.use_creation_context
        state = update_substate(state, "creation_context", "use_creation_context", use_creation_context)
    }


    if (is_set_label_ids(action))
    {
        const creation_context: CreationContext = {
            ...state.creation_context.creation_context,
            label_ids: action.label_ids,
        }
        state = update_substate(state, "creation_context", "creation_context", creation_context)
        // If there are any label ids then automatically enable the use_creation_context
        if (action.label_ids.length > 0)
        {
            state = update_substate(state, "creation_context", "use_creation_context", true)
        }
    }


    if (is_set_replace_text(action))
    {
        const creation_context: CreationContext = {
            label_ids: [],
            ...state.creation_context.creation_context,
        }

        if (action.value_type === "target")
        {
            creation_context.replace_text_target = action.value
        }
        else
        {
            creation_context.replace_text_replacement = action.value
        }

        state = update_substate(state, "creation_context", "creation_context", creation_context)
    }


    return state
}
