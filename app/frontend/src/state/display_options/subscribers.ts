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
    })
}
