import type { AnyAction } from "redux"

import { toggle_item_in_list } from "../../../../utils/list"
import { update_substate } from "../../../../utils/update_state"
import type { RootState } from "../../../State"
import {
    is_clicked_wcomponent,
    is_clear_selected_wcomponents,
    is_pointerdown_on_connection_terminal,
    is_clear_pointerupdown_on_connection_terminal,
    is_set_selected_wcomponents,
    ActionSetSelectedWcomponents,
} from "./actions"



export const selecting_reducer = (state: RootState, action: AnyAction): RootState =>
{
    const initial_selected_wcomponent_ids_list = state.meta_wcomponents.selected_wcomponent_ids_list


    if (is_clicked_wcomponent(action))
    {
        const { id } = action
        let selected_wcomponent_ids_list = [...state.meta_wcomponents.selected_wcomponent_ids_list]

        const { shift_or_control_down } = state.global_keys.derived

        if (shift_or_control_down)
        {
            selected_wcomponent_ids_list = toggle_item_in_list(selected_wcomponent_ids_list, i => i === id, id)
        }
        else
        {
            selected_wcomponent_ids_list = [id]
        }

        const meta_wcomponents = {
            ...state.meta_wcomponents,
            selected_wcomponent_ids_list,
            last_clicked_wcomponent_id: id,
        }

        state = { ...state, meta_wcomponents }
    }


    if (is_clear_selected_wcomponents(action))
    {
        state = handle_clear_selected_wcomponents(state)
    }


    if (is_set_selected_wcomponents(action))
    {
        state = handle_set_selected_wcomponents(state, action)
    }


    // The idea behind this functionality is that if there are >0 components selected when a
    // different knowledge view is navigated to then if they are edited it (should) cause an
    // exception in the bulk editing reducer as we do not yet filter for ids in that knowledge view
    // It is disabled because it prevents creating judgements on a selected wcomponent
    // if (is_change_route(action))
    // {
    //     if (action.args && action.args.view === "knowledge")
    //     {
    //         state = handle_clear_selected_wcomponents(state)
    //     }
    // }


    if (is_pointerdown_on_connection_terminal(action))
    {
        const { wcomponent_id, terminal_type } = action
        const value = { wcomponent_id, terminal_type }
        state = update_substate(state, "meta_wcomponents", "last_pointer_down_connection_terminal", value)
    }


    if (is_clear_pointerupdown_on_connection_terminal(action))
    {
        state = update_substate(state, "meta_wcomponents", "last_pointer_down_connection_terminal", undefined)
    }


    if (initial_selected_wcomponent_ids_list !== state.meta_wcomponents.selected_wcomponent_ids_list)
    {
        const selected_wcomponent_ids_set = new Set(state.meta_wcomponents.selected_wcomponent_ids_list)
        const map: { [id: string]: number } = {}
        state.meta_wcomponents.selected_wcomponent_ids_list.forEach((id, index) => map[id] = index)

        const meta_wcomponents = {
            ...state.meta_wcomponents,
            selected_wcomponent_ids_set,
            selected_wcomponent_ids_map: map,
        }

        state = { ...state, meta_wcomponents }
    }


    return state
}



function handle_clear_selected_wcomponents (state: RootState): RootState {
    state = update_substate(state, "meta_wcomponents", "selected_wcomponent_ids_list", [])

    return state
}



function handle_set_selected_wcomponents (state: RootState, action: ActionSetSelectedWcomponents): RootState {
    state = update_substate(state, "meta_wcomponents", "selected_wcomponent_ids_list", [...action.ids])

    return state
}
