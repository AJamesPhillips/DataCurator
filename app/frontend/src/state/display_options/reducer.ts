import type { AnyAction } from "redux"

import { update_substate } from "../../utils/update_state"
import type { RootState } from "../State"
import { is_set_time_resolution, is_set_validity_filter, is_toggle_consumption_formatting, is_update_canvas_bounding_rect } from "./actions"
import type { ValidityFilterOption } from "./state"



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
        const derived_validity_filter: ValidityFilterOption = {
            only_certain_valid: action.validity_filter === "only_certain_valid",
            only_maybe_valid: action.validity_filter === "only_maybe_valid",
            maybe_invalid: action.validity_filter === "maybe_invalid",
            show_invalid: action.validity_filter === "show_invalid",
        }
        state = update_substate(state, "display_options", "derived_validity_filter", derived_validity_filter)
    }


    return state
}
