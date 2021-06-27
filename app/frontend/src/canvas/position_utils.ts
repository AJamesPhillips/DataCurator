import type { CanvasPoint, Position } from "./interfaces"



export const grid_small_step = 20
export const h_step = grid_small_step * 18
export const v_step = grid_small_step * 8

export function round_number (num: number, round_to: number): number
{
    return Math.round(num / round_to) * round_to
}


export function round_coordinate_small_step (num: number): number
{
    return round_number(num, grid_small_step)
}



export function position_to_point (position: Position): CanvasPoint
{
    return { left: position.x, top: -position.y }
}



export function round_canvas_point (point: CanvasPoint, step: "small" | "large" = "small"): CanvasPoint
{
    if (step === "small")
    {
        return { left: round_coordinate_small_step(point.left), top: round_coordinate_small_step(point.top) }
    }
    else
    {
        return { left: round_number(point.left, h_step), top: round_number(point.top, v_step) }
    }
}
