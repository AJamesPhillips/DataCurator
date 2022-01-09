import type { Action, AnyAction } from "redux"



interface SetActionIdsToShowArgs
{
    action_ids: string[]
    date_shown?: Date
}

interface ActionSetActionIdsToShow extends Action, SetActionIdsToShowArgs {}

const set_action_ids_to_show_type = "set_action_ids_to_show"

const set_action_ids_to_show = (args: SetActionIdsToShowArgs): ActionSetActionIdsToShow =>
{
    return { type: set_action_ids_to_show_type, ...args }
}

export const is_set_action_ids_to_show = (action: AnyAction): action is ActionSetActionIdsToShow => {
    return action.type === set_action_ids_to_show_type
}



export const view_priorities_actions = {
    set_action_ids_to_show,
}
