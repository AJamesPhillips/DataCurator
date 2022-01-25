import type { AnyAction } from "redux"

import { update_substate } from "../../../utils/update_state"
import type { RootState } from "../../State"
import { is_set_frame_is_resizing } from "./actions"
import { find_all_causal_paths_reducer } from "./find_all_causal_paths/reducer"
import { selecting_reducer } from "./selecting/reducer"



export const meta_wcomponents_reducer = (state: RootState, action: AnyAction): RootState =>
{
    state = find_all_causal_paths_reducer(state, action)
    state = selecting_reducer(state, action)


    if (is_set_frame_is_resizing(action))
    {
        state = update_substate(state, "meta_wcomponents", "frame_is_resizing", action.frame_is_resizing)
    }

    return state
}
