import type { Action, AnyAction } from "redux"



const toggle_use_creation_context_type = "toggle_use_creation_context"

const toggle_use_creation_context = (): Action =>
{
    return { type: toggle_use_creation_context_type }
}

export const is_toggle_use_creation_context = (action: AnyAction): action is Action => {
    return action.type === toggle_use_creation_context_type
}


interface SetLabelIdsArgs
{
    label_ids: string[]
}
interface ActionSetLabelIds extends Action, SetLabelIdsArgs {}

const set_label_ids_type = "set_label_ids"

const set_label_ids = (args: SetLabelIdsArgs): ActionSetLabelIds =>
{
    return { type: set_label_ids_type, ...args }
}

export const is_set_label_ids = (action: AnyAction): action is ActionSetLabelIds => {
    return action.type === set_label_ids_type
}



interface SetReplaceTextArgs
{
    value: string | undefined
    value_type: "target" | "replacement"
}
interface ActionSetReplaceText extends Action, SetReplaceTextArgs {}

const set_replace_text_type = "set_replace_text"

const set_replace_text = (args: SetReplaceTextArgs): ActionSetReplaceText =>
{
    return { type: set_replace_text_type, ...args }
}

export const is_set_replace_text = (action: AnyAction): action is ActionSetReplaceText => {
    return action.type === set_replace_text_type
}



export const creation_context_actions = {
    toggle_use_creation_context,
    set_label_ids,
    set_replace_text,
}
