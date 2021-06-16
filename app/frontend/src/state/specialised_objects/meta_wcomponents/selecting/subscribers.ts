import type { Store } from "redux"
import { ACTIONS } from "../../../actions"

import { pub_sub } from "../../../pub_sub/pub_sub"
import type { RootState } from "../../../State"



export function meta_wcomponents_selecting_subscribers (store: Store<RootState>)
{
    handle_ctrl_a(store)
}



function handle_ctrl_a (store: Store<RootState>)
{
    pub_sub.global_keys.sub("key_down", k =>
    {
        if (k.key === "a" && k.ctrl_key)
        {
            // store.dispatch(ACTIONS.)
        }
    })
}
