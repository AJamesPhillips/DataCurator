import type { Store } from "redux"

import { ACTIONS } from "../actions"
import type { RootState } from "../State"
import type { ActionKeyEventArgs } from "./actions"



export function record_keyupdown_activity (store: Store<RootState>)
{

    document.onkeydown = e =>
    {
        const action_args: ActionKeyEventArgs = {
            time_stamp: e.timeStamp,
            alt_key: e.altKey,
            code: e.code,
            ctrl_key: e.ctrlKey,
            key: e.key,
            meta_key: e.metaKey,
            return_value: e.returnValue,
            shift_key: e.shiftKey,
        }

        store.dispatch(ACTIONS.global_keys.key_down(action_args))
    }

    document.onkeyup = e =>
    {
        const action_args: ActionKeyEventArgs = {
            time_stamp: e.timeStamp,
            alt_key: e.altKey,
            code: e.code,
            ctrl_key: e.ctrlKey,
            key: e.key,
            meta_key: e.metaKey,
            return_value: e.returnValue,
            shift_key: e.shiftKey,
        }

        store.dispatch(ACTIONS.global_keys.key_up(action_args))
    }

    // https://stackoverflow.com/questions/13640061/get-a-list-of-all-currently-pressed-keys-in-javascript#comment105002776_13640097
    window.onfocus = () =>
    {
        if (store.getState().global_keys.keys_down.size === 0) return

        store.dispatch(ACTIONS.global_keys.clear_all_keys())
    }
}
