

export interface CanvasPointerEvent
{
    ms: number
    x: number
    y: number
}

export interface CanvasState
{
    last_double_tap: CanvasPointerEvent | undefined
    last_right_click: CanvasPointerEvent | undefined
}
