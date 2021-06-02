import type { AnyAction } from "redux"

import { update_substate } from "../../utils/update_state"
import type { RootState } from "../State"
import { is_set_time_resolution, is_set_validity_filter, is_set_validity_formatting, is_toggle_consumption_formatting, is_update_canvas_bounding_rect } from "./actions"
import { derive_validity_filter, derive_validity_formatting } from "./util"



export const display_reducer = (state: RootState, action: AnyAction): RootState =>
{
    if (is_toggle_consumption_formatting(action))
    {
        state = update_substate(state, "display_options", "consumption_formatting", !state.display_options.consumption_formatting)
    }


    if (is_update_canvas_bounding_rect(action))
    {
        state = update_substate(state, "display_options", "canvas_bounding_rect", action.bounding_rect)
    }


    if (is_set_time_resolution(action))
    {
        state = update_substate(state, "display_options", "time_resolution", action.time_resolution)
    }


    if (is_set_validity_filter(action))
    {
        state = update_substate(state, "display_options", "validity_filter", action.validity_filter)
        const derived_validity_filter = derive_validity_filter(action.validity_filter)
        state = update_substate(state, "display_options", "derived_validity_filter", derived_validity_filter)
    }


    if (is_set_validity_formatting(action))
    {
        state = update_substate(state, "display_options", "validity_formatting", action.validity_formatting)
        const derived_validity_formatting = derive_validity_formatting(action.validity_formatting)
        state = update_substate(state, "display_options", "derived_validity_formatting", derived_validity_formatting)
    }


    return state
}
