import type { AnyAction } from "redux"

import { update_substate } from "../../utils/update_state"
import type { RootState } from "../State"
import { is_set_apply_filter, is_set_filters } from "./actions"



export const filter_context_reducer = (state: RootState, action: AnyAction): RootState =>
{

    if (is_set_apply_filter(action))
    {
        state = update_substate(state, "filter_context", "apply_filter", action.apply_filter)
    }


    if (is_set_filters(action))
    {
        state = update_substate(state, "filter_context", "filters", action.filters)
        state = update_substate(state, "filter_context", "apply_filter", action.filters.length > 0)
    }


    return state
}
