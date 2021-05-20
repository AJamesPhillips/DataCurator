import type { Action, AnyAction } from "redux"



interface ActionToggleUseCreationContext extends Action {}

const toggle_use_creation_context_type = "toggle_use_creation_context"

const toggle_use_creation_context = (): ActionToggleUseCreationContext =>
{
    return { type: toggle_use_creation_context_type }
}

export const is_toggle_use_creation_context = (action: AnyAction): action is ActionToggleUseCreationContext => {
    return action.type === toggle_use_creation_context_type
}



interface SetCustomCreatedAtArgs
{
    custom_created_at: Date | undefined
}
interface ActionSetCustomCreatedAt extends Action, SetCustomCreatedAtArgs {}

const set_custom_created_at_type = "set_custom_created_at"

const set_custom_created_at = (args: SetCustomCreatedAtArgs): ActionSetCustomCreatedAt =>
{
    return { type: set_custom_created_at_type, ...args }
}

export const is_set_custom_created_at = (action: AnyAction): action is ActionSetCustomCreatedAt => {
    return action.type === set_custom_created_at_type
}



export const creation_context_actions = {
    toggle_use_creation_context,
    set_custom_created_at,
}
