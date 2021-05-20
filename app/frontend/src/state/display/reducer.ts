import type { AnyAction } from "redux"
import { update_substate } from "../../utils/update_state"

import type { RootState } from "../State"
import { is_set_time_resolution, is_toggle_rich_text_formatting, is_update_canvas_bounding_rect } from "./actions"



export const display_reducer = (state: RootState, action: AnyAction): RootState =>
{
    if (is_toggle_rich_text_formatting(action))
    {
        state = {
            ...state,
            display: {
                ...state.display,
                last_toggle_rich_text_formatting_time_stamp: action.last_toggle_rich_text_formatting_time_stamp,
                rich_text_formatting: !state.display.rich_text_formatting,
            }
        }
    }


    if (is_update_canvas_bounding_rect(action))
    {
        state = update_substate(state, "display", "canvas_bounding_rect", action.bounding_rect)
    }


    if (is_set_time_resolution(action))
    {
        state = update_substate(state, "display", "time_resolution", action.time_resolution)
    }


    return state
}
