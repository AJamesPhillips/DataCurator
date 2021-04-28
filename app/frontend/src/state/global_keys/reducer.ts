import type { AnyAction } from "redux"
import { update_substate } from "../../utils/update_state"

import type { RootState } from "../State"
import { is_clear_all_keys, is_key_down, is_key_up } from "./actions"



export const global_keys_reducer = (state: RootState, action: AnyAction): RootState =>
{

    if (is_key_down(action))
    {
        const keys_down = new Set([...state.global_keys.keys_down])
        keys_down.add(action.key)

        state = {
            ...state,
            global_keys: {
                last_key: action.key,
                last_key_time_stamp: action.time_stamp,
                keys_down,
            }
        }
    }

    if (is_key_up(action))
    {
        let keys_down = new Set([...state.global_keys.keys_down])
        keys_down.delete(action.key)

        // Web browsers are broken: https://web.archive.org/web/20160304022453/http://bitspushedaround.com/on-a-few-things-you-may-not-know-about-the-hellish-command-key-and-javascript-events/
        // Clear all keys as Meta steals keyup events of all other keys
        // Update: 2021-04-28 this seems to not be the case any more so will comment this out for now
        // if (action.key === "Meta") keys_down = new Set()

        state = {
            ...state,
            global_keys: {
                last_key: action.key,
                last_key_time_stamp: action.time_stamp,
                keys_down,
            }
        }
    }


    if (is_clear_all_keys(action))
    {
        state = update_substate(state, "global_keys", "keys_down", new Set<string>())
    }

    return state
}
