import type { AnyAction } from "redux"

import { update_substate } from "../../utils/update_state"
import type { RootState } from "../State"
import {
    is_set_time_resolution,
    is_set_validity_filter,
    is_set_certainty_formatting,
    is_toggle_consumption_formatting,
    is_set_display_by_simulated_time,
    is_toggle_focused_mode,
    is_set_show_help_menu,
    is_set_display_time_marks,
    is_set_or_toggle_animate_causal_links,
    is_set_or_toggle_show_large_grid,
} from "./actions"
import { derive_validity_filter, derive_certainty_formatting } from "./util"



export const display_reducer = (state: RootState, action: AnyAction): RootState =>
{
    if (is_toggle_consumption_formatting(action))
    {
        state = update_substate(state, "display_options", "consumption_formatting", !state.display_options.consumption_formatting)
    }


    if (is_toggle_focused_mode(action))
    {
        state = update_substate(state, "display_options", "focused_mode", !state.display_options.focused_mode)
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


    if (is_set_certainty_formatting(action))
    {
        state = update_substate(state, "display_options", "certainty_formatting", action.certainty_formatting)
        const derived_certainty_formatting = derive_certainty_formatting(action.certainty_formatting)
        state = update_substate(state, "display_options", "derived_certainty_formatting", derived_certainty_formatting)
    }


    if (is_set_display_by_simulated_time(action))
    {
        state = update_substate(state, "display_options", "display_by_simulated_time", action.display_by_simulated_time)
    }


    if (is_set_display_time_marks(action))
    {
        state = update_substate(state, "display_options", "display_time_marks", action.display_time_marks)
    }


    if (is_set_or_toggle_animate_causal_links(action))
    {
        const animate_causal_links = boolean_or_toggle(action.animate_causal_links, state.display_options.animate_causal_links)
        state = update_substate(state, "display_options", "animate_causal_links", animate_causal_links)
    }


    if (is_set_show_help_menu(action))
    {
        state = update_substate(state, "display_options", "show_help_menu", action.show)
    }


    if (is_set_or_toggle_show_large_grid(action))
    {
        const show_large_grid = boolean_or_toggle(action.show_large_grid, state.display_options.show_large_grid)
        state = update_substate(state, "display_options", "show_large_grid", show_large_grid)
    }


    return state
}



function boolean_or_toggle (new_value: boolean | undefined, current_value: boolean)
{
    if (new_value === undefined) new_value = !current_value

    return new_value
}
