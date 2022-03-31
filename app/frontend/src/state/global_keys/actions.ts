import type { Action, AnyAction } from "redux"



export interface ActionKeyEventArgs
{
    event: KeyboardEvent
    time_stamp: number
    alt_key: boolean
    code: string
    ctrl_key: boolean
    key: string
    meta_key: boolean
    shift_key: boolean
}


//


interface ActionKeyDown extends Action, ActionKeyEventArgs {}

const key_down_type = "key_down"

const key_down = (global_key_press_args: ActionKeyEventArgs): ActionKeyDown =>
{
    return { type: key_down_type, ...global_key_press_args }
}

export const is_key_down = (action: AnyAction): action is ActionKeyDown => {
    return action.type === key_down_type
}


//


interface ActionKeyUp extends Action, ActionKeyEventArgs {}

const key_up_type = "key_up"

const key_up = (global_key_press_args: ActionKeyEventArgs): ActionKeyUp =>
{
    return { type: key_up_type, ...global_key_press_args }
}

export const is_key_up = (action: AnyAction): action is ActionKeyUp => {
    return action.type === key_up_type
}



interface ActionClearAllKeys extends Action {}

const clear_all_keys_type = "clear_all_keys"

const clear_all_keys = (): ActionClearAllKeys =>
{
    return { type: clear_all_keys_type }
}

export const is_clear_all_keys = (action: AnyAction): action is ActionClearAllKeys => {
    return action.type === clear_all_keys_type
}

//


export const global_keys_actions = {
    key_down,
    key_up,
    clear_all_keys,
}
