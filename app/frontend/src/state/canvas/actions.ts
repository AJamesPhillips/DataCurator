import type { Action, AnyAction } from "redux"



interface CanvasRightClickedArgs
{
    x: number
    y: number
}
interface ActionCanvasRightClicked extends Action, CanvasRightClickedArgs {}

const canvas_right_clicked_type = "canvas_right_clicked"

const canvas_right_clicked = (args: CanvasRightClickedArgs): ActionCanvasRightClicked =>
{
    return { type: canvas_right_clicked_type, ...args }
}

export const is_canvas_right_clicked = (action: AnyAction): action is ActionCanvasRightClicked => {
    return action.type === canvas_right_clicked_type
}



interface CanvasDoubleTappedArgs
{
    x: number
    y: number
}
interface ActionCanvasDoubleTapped extends Action, CanvasDoubleTappedArgs {}

const canvas_double_tapped_type = "canvas_double_tapped"

const canvas_double_tapped = (args: CanvasDoubleTappedArgs): ActionCanvasDoubleTapped =>
{
    return { type: canvas_double_tapped_type, ...args }
}

export const is_canvas_double_tapped = (action: AnyAction): action is ActionCanvasDoubleTapped => {
    return action.type === canvas_double_tapped_type
}



export const canvas_actions = {
    canvas_right_clicked,
    canvas_double_tapped,
}
