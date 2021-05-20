import type { Action, AnyAction } from "redux"

import type { TimeResolution } from "../../shared/utils/datetime"
import type { BoundingRect } from "./state"



interface ToggleRichTextFormattingArgs
{
    last_toggle_rich_text_formatting_time_stamp: number
}
interface ActionToggleRichTextFormatting extends Action, ToggleRichTextFormattingArgs {}

const toggle_rich_text_formatting_type = "toggle_rich_text_formatting"

const toggle_rich_text_formatting = (args: ToggleRichTextFormattingArgs): ActionToggleRichTextFormatting =>
{
    return { type: toggle_rich_text_formatting_type, ...args }
}

export const is_toggle_rich_text_formatting = (action: AnyAction): action is ActionToggleRichTextFormatting => {
    return action.type === toggle_rich_text_formatting_type
}



interface UpdateCanvasBoundingRectArgs
{
    bounding_rect: BoundingRect
}
interface ActionUpdateCanvasBoundingRect extends Action, UpdateCanvasBoundingRectArgs {}

const update_canvas_bounding_rect_type = "update_canvas_bounding_rect"

const update_canvas_bounding_rect = (args: UpdateCanvasBoundingRectArgs): ActionUpdateCanvasBoundingRect =>
{
    return { type: update_canvas_bounding_rect_type, ...args }
}

export const is_update_canvas_bounding_rect = (action: AnyAction): action is ActionUpdateCanvasBoundingRect => {
    return action.type === update_canvas_bounding_rect_type
}



interface SetTimeResolutionArgs
{
    time_resolution: TimeResolution
}
interface ActionSetTimeResolution extends Action, SetTimeResolutionArgs {}

const set_time_resolution_type = "set_time_resolution"

const set_time_resolution = (args: SetTimeResolutionArgs): ActionSetTimeResolution =>
{
    return { type: set_time_resolution_type, ...args }
}

export const is_set_time_resolution = (action: AnyAction): action is ActionSetTimeResolution => {
    return action.type === set_time_resolution_type
}



export const display_actions = {
    toggle_rich_text_formatting,
    update_canvas_bounding_rect,
    set_time_resolution,
}
