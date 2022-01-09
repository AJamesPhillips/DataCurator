import type { AnyAction } from "redux"

import { update_substate } from "../../utils/update_state"
import type { RootState } from "../State"
import {
    is_set_action_ids_to_show,
} from "./actions"



export const view_priorities_reducer = (state: RootState, action: AnyAction): RootState =>
{

    if (is_set_action_ids_to_show(action))
    {
        state = update_substate(state, "view_priorities", "action_ids_to_show", action.action_ids)
        state = update_substate(state, "view_priorities", "date_shown", action.date_shown)
    }

    return state
}
