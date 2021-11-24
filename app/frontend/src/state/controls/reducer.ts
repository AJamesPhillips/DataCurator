import type { AnyAction } from "redux"

import { update_substate } from "../../utils/update_state"
import type { RootState } from "../State"
import {
    is_set_display_time_sliders,
    is_set_or_toggle_display_select_storage,
    is_set_or_toggle_display_side_panel,
    is_toggle_display_time_sliders,
    is_toggle_linked_datetime_sliders,
} from "./actions"



export const controls_reducer = (state: RootState, action: AnyAction): RootState =>
{
    if (is_toggle_linked_datetime_sliders(action))
    {
        const linked_datetime_sliders = !state.controls.linked_datetime_sliders
        state = update_substate(state, "controls", "linked_datetime_sliders", linked_datetime_sliders)
    }


    if (is_set_display_time_sliders(action))
    {
        const { display_time_sliders } = action
        state = update_substate(state, "controls", "display_time_sliders", display_time_sliders)
    }


    if (is_toggle_display_time_sliders(action))
    {
        const { display_time_sliders } = state.controls
        state = update_substate(state, "controls", "display_time_sliders", !display_time_sliders)
    }


    if (is_set_or_toggle_display_side_panel(action))
    {
        const { display_side_panel } = state.controls
        const new_display_side_panel = action.display_side_panel ?? !display_side_panel
        state = update_substate(state, "controls", "display_side_panel", new_display_side_panel)
    }


    if (is_set_or_toggle_display_select_storage(action))
    {
        const { display_select_storage } = state.controls
        const new_display_select_storage = action.display_select_storage ?? !display_select_storage
        state = update_substate(state, "controls", "display_select_storage", new_display_select_storage)
    }


    return state
}
