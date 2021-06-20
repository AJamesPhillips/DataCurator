import type { Action, AnyAction } from "redux"



interface ActionSetEditingTextFlag extends Action
{
    editing_text: boolean
}

const set_editing_text_flag_type = "set_editing_text_flag"

const set_editing_text_flag = (editing_text: boolean): ActionSetEditingTextFlag =>
{
    return { type: set_editing_text_flag_type, editing_text }
}

export const is_set_editing_text_flag = (action: AnyAction): action is ActionSetEditingTextFlag => {
    return action.type === set_editing_text_flag_type
}



export const user_activity_actions = {
    set_editing_text_flag,
}
