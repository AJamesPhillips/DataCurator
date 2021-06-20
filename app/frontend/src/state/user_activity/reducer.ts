import type { AnyAction } from "redux"

import { update_substate, update_subsubstate } from "../../utils/update_state"
import type { RootState } from "../State"
import { is_set_editing_text_flag } from "./actions"



export const user_activity_reducer = (state: RootState, action: AnyAction): RootState =>
{

    if (is_set_editing_text_flag(action))
    {
        state = update_substate(state, "user_activity", "is_editing_text", action.editing_text)
    }


    return state
}
