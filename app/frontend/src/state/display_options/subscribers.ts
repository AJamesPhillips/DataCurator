import { ACTIONS } from "../actions"
import type { ActionKeyEventArgs } from "../global_keys/actions"
import { pub_sub } from "../pub_sub/pub_sub"
import { conditional_ctrl_f_search } from "../search/conditional_ctrl_f_search"
import {
    conditionally_decrease_selected_components,
    conditionally_expand_selected_components,
    conditionally_select_all_components,
    conditionally_select_forward_causal_components,
    conditionally_select_interconnections,
    conditionally_select_source_causal_components,
} from "../specialised_objects/meta_wcomponents/selecting/helpers"
import { handle_ctrl_a } from "../specialised_objects/meta_wcomponents/selecting/subscribers"
import type { StoreType } from "../store"



export function display_options_subscribers (store: StoreType)
{
    toggle_consumption_formatting_on_key_press(store)
}


// todo update name of function to reflect all the other things it does now
function toggle_consumption_formatting_on_key_press (store: StoreType)
{
    let key_combination = ""

    pub_sub.global_keys.sub("key_down", e =>
    {
        if (key_combination)
        {
            handle_key_combo(key_combination, e, store)
            return
        }

        const start_key_combo = e.ctrl_key && root_key_combo.has(e.key)
        key_combination = start_key_combo ? key_combination = e.key : ""
        if (start_key_combo)
        {
            e.event.preventDefault()
            return
        }

        if (e.ctrl_key && e.key === "e")
        {
            e.event.preventDefault()
            store.dispatch(ACTIONS.display.toggle_consumption_formatting({}))
        }

        else if (e.shift_key && e.key === "?")
        {
            e.event.preventDefault()
            const state = store.getState()
            if (!state.display_options.show_help_menu)
            {
                store.dispatch(ACTIONS.display.set_show_help_menu({ show: true }))
            }
        }

        else
        {
            handle_ctrl_a(store, e)
            conditional_ctrl_f_search(store, e)
        }
    })


    pub_sub.global_keys.sub("key_up", e =>
    {
        if (e.key === "Control") key_combination = ""
        // console .log("key up, key_combination now = ", key_combination)
    })
}


function handle_key_combo (key_combination: string, e: ActionKeyEventArgs, store: StoreType)
{
    let handled_key = false
    if (key_combination === "d")
    {
        handled_key = handle_display_key_combo(e.key, store)
    }
    else if (key_combination === "s")
    {
        handled_key = handle_selection_key_combo(e.key, store)
    }

    if (handled_key)
    {
        // (Attempt to) Stop Brave on Windows from using `ctrl + d` to make a new book mark
        // or `ctrl + s` to save the page
        // See issue #172
        e.event.preventDefault()
    }

    // return clear_key_combination
}



export const root_key_combo = new Set(["d", "s"])



function handle_display_key_combo (key: string, store: StoreType)
{
    let handled_key = true

    if (key === "f")
    {
        store.dispatch(ACTIONS.display.set_or_toggle_focused_mode())
    }
    else if (key === "t")
    {
        store.dispatch(ACTIONS.controls.toggle_display_time_sliders())
    }
    else if (key === "s")
    {
        store.dispatch(ACTIONS.controls.set_or_toggle_display_side_panel())
    }
    else if (key === "a")
    {
        store.dispatch(ACTIONS.display.set_or_toggle_animate_connections())
    }
    else if (key === "c")
    {
        store.dispatch(ACTIONS.display.set_or_toggle_circular_links())
    }
    else
    {
        handled_key = false
    }

    return handled_key
}



function handle_selection_key_combo (key: string, store: StoreType)
{
    let handled_key = true

    if (key === "a")
    {
        conditionally_select_all_components(store)
    }
    else if (key === "e")
    {
        conditionally_expand_selected_components(store)
    }
    else if (key === "d")
    {
        conditionally_decrease_selected_components(store)
    }
    else if (key === "f")
    {
        conditionally_select_forward_causal_components(store)
    }
    else if (key === "c")
    {
        conditionally_select_source_causal_components(store)
    }
    else if (key === "i")
    {
        conditionally_select_interconnections(store)
    }
    else
    {
        handled_key = false
    }

    return handled_key
}
