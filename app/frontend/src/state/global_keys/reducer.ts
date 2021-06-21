import type { AnyAction } from "redux"
import { update_substate } from "../../utils/update_state"

import type { RootState } from "../State"
import { is_clear_all_keys, is_key_down, is_key_up } from "./actions"
import type { GlobalKeysState } from "./state"



export const global_keys_reducer = (state: RootState, action: AnyAction): RootState =>
{
    let should_update_derived = false


    if (is_key_down(action))
    {
        should_update_derived = true

        const keys_down = new Set([...state.global_keys.keys_down])
        keys_down.add(action.key)

        state = {
            ...state,
            global_keys: {
                ...state.global_keys,
                last_key: action.key,
                last_key_time_stamp: action.time_stamp,
                keys_down,
            }
        }
    }

    if (is_key_up(action))
    {
        should_update_derived = true

        let keys_down = new Set([...state.global_keys.keys_down])
        keys_down.delete(action.key)

        // Web browsers are broken: https://web.archive.org/web/20160304022453/http://bitspushedaround.com/on-a-few-things-you-may-not-know-about-the-hellish-command-key-and-javascript-events/
        // Clear all keys as Meta steals keyup events of all other keys
        // Update: 2021-04-28 this seems to not be the case any more so will comment this out for now
        // if (action.key === "Meta") keys_down = new Set()

        state = {
            ...state,
            global_keys: {
                ...state.global_keys,
                last_key: action.key,
                last_key_time_stamp: action.time_stamp,
                keys_down,
            }
        }
    }


    if (is_clear_all_keys(action))
    {
        should_update_derived = true

        state = update_substate(state, "global_keys", "keys_down", new Set<string>())
    }


    if (should_update_derived) state = set_derived_state(state)


    return state
}



function set_derived_state (state: RootState)
{
    const { keys_down } = state.global_keys
    const control_down = keys_down.has("Control")
    const shift_down = keys_down.has("Shift")

    const global_keys: GlobalKeysState = {
        ...state.global_keys,
        derived: {
            shift_down,
            control_down,
            shift_or_control_down: control_down || shift_down
        }
    }

    return { ...state, global_keys }
}
