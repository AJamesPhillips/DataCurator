import type { AnyAction } from "redux"

import { update_substate } from "../../utils/update_state"
import type { RootState } from "../State"
import {
    is_set_time_resolution,
    is_set_validity_filter,
    is_set_certainty_formatting,
    is_toggle_consumption_formatting,
    is_set_display_by_simulated_time,
} from "./actions"
import { derive_validity_filter, derive_certainty_formatting } from "./util"



export const display_reducer = (state: RootState, action: AnyAction): RootState =>
{
    if (is_toggle_consumption_formatting(action))
    {
        state = update_substate(state, "display_options", "consumption_formatting", !state.display_options.consumption_formatting)
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

    return state
}
