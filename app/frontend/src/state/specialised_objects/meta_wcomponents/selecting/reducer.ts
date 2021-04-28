import type { AnyAction } from "redux"
import { toggle_item_in_list } from "../../../../utils/list"

import { toggle_item_in_set } from "../../../../utils/set"
import { update_substate } from "../../../../utils/update_state"
import type { RootState } from "../../../State"
import { is_clicked_wcomponent, is_clear_selected_wcomponents, is_set_intercept_wcomponent_click_to_edit_link, is_pointerdown_on_connection_terminal, is_clear_pointerupdown_on_connection_terminal } from "./actions"



export const selecting_reducer = (state: RootState, action: AnyAction): RootState =>
{

    if (is_clicked_wcomponent(action))
    {
        const { id } = action
        let selected_wcomponent_ids_list = [...state.meta_wcomponents.selected_wcomponent_ids_list]
        let selected_wcomponent_ids = new Set(state.meta_wcomponents.selected_wcomponent_ids)

        const meta_key_down = state.global_keys.keys_down.has("Control")

        if (meta_key_down)
        {
            selected_wcomponent_ids_list = toggle_item_in_list(selected_wcomponent_ids_list, id2 => id2 === id, id)
            toggle_item_in_set(selected_wcomponent_ids, id)
        }
        else
        {
            selected_wcomponent_ids_list = [id]
            selected_wcomponent_ids = new Set(selected_wcomponent_ids_list)
        }

        const meta_wcomponents = {
            ...state.meta_wcomponents,
            selected_wcomponent_ids_list,
            selected_wcomponent_ids,
            last_clicked_wcomponent_id: id,
        }

        state = { ...state, meta_wcomponents }
    }


    if (is_clear_selected_wcomponents(action))
    {
        state = handle_clear_selected_wcomponents(state)
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


    if (is_set_intercept_wcomponent_click_to_edit_link(action))
    {
        const intercept = !action.edit_wcomponent_id
            ? undefined
            : { edit_wcomponent_id: action.edit_wcomponent_id, connection_terminal_type: action.connection_terminal_type }
        state = update_substate(state, "meta_wcomponents", "intercept_wcomponent_click_to_edit_link", intercept)
    }


    if (is_pointerdown_on_connection_terminal(action))
    {
        const { wcomponent_id, connection_location } = action
        const value = { wcomponent_id, connection_location }
        state = update_substate(state, "meta_wcomponents", "last_pointer_down_connection_terminal", value)
    }


    if (is_clear_pointerupdown_on_connection_terminal(action))
    {
        state = update_substate(state, "meta_wcomponents", "last_pointer_down_connection_terminal", undefined)
    }


    return state
}



function handle_clear_selected_wcomponents (state: RootState): RootState {
    state = update_substate(state, "meta_wcomponents", "selected_wcomponent_ids_list", [])
    state = update_substate(state, "meta_wcomponents", "selected_wcomponent_ids", new Set<string>())

    return state
}
