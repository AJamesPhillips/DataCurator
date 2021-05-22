import type { AnyAction } from "redux"

import { update_substate } from "../../utils/update_state"
import type { RootState } from "../State"
import { is_canvas_double_tapped, is_canvas_right_clicked } from "./actions"



export const canvas_reducer = (state: RootState, action: AnyAction): RootState =>
{

    if (is_canvas_double_tapped(action))
    {
        const last_double_tap = { ...action }
        delete last_double_tap.type
        state = update_substate(state, "canvas", "last_double_tap", last_double_tap)
    }


    if (is_canvas_right_clicked(action))
    {
        const last_right_click = { ...action }
        delete last_right_click.type
        state = update_substate(state, "canvas", "last_right_click", last_right_click)
    }

    return state
}
