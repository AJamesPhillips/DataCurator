import type { Store } from "redux"

import { ACTIONS } from "../actions"
import { pub_sub } from "../pub_sub/pub_sub"
import type { RootState } from "../State"



export function display_options_subscribers (store: Store<RootState>)
{
    toggle_consumption_formatting_on_key_press(store)
}


function toggle_consumption_formatting_on_key_press (store: Store<RootState>)
{
    pub_sub.global_keys.sub("key_down", e =>
    {
        if (e.ctrl_key && e.key === "e")
        {
            store.dispatch(ACTIONS.display.toggle_consumption_formatting({}))
        }

        if (e.ctrl_key && e.key === "d")
        {
            store.dispatch(ACTIONS.display.toggle_focused_mode({}))
        }

        const show_help_menu = e.shift_key && e.key === "?"
        if (show_help_menu)
        {
            const state = store.getState()
            if (!state.display_options.show_help_menu && !state.user_activity.is_editing_text)
            {
                store.dispatch(ACTIONS.display.set_show_help_menu({ show: show_help_menu }))
            }
        }
    })
}
