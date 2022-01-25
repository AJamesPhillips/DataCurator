import type { Action, AnyAction } from "redux"
import { safe_merge } from "../../../utils/object"
import { find_all_causal_paths_actions } from "./find_all_causal_paths/actions"
import { selecting_actions } from "./selecting/actions"



interface SetFrameIsResizingProps
{
    frame_is_resizing: boolean
}
interface ActionSetFrameIsResizing extends Action, SetFrameIsResizingProps {}

const set_frame_is_resizing_type = "set_frame_is_resizing"

const set_frame_is_resizing = (args: SetFrameIsResizingProps): ActionSetFrameIsResizing =>
{
    return { type: set_frame_is_resizing_type, ...args }
}

export const is_set_frame_is_resizing = (action: AnyAction): action is ActionSetFrameIsResizing => {
    return action.type === set_frame_is_resizing_type
}



export const meta_wcomponents_actions = safe_merge({
    set_frame_is_resizing,
},
    selecting_actions,
    find_all_causal_paths_actions,
)
