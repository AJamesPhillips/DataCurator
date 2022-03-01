import type { KnowledgeViewWComponentEntry } from "../shared/interfaces/knowledge_view"
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



export const NODE_WIDTH = 250 // keep in sync with .connectable_canvas_node style
// Ignoring the size parameter for knowledge view entries, a canvas node with an image will appear larger
export const node_height_approx = (has_image = false) => has_image ? 120 : 59
const half_node_width = NODE_WIDTH / 2
const half_node_height = (has_image: boolean) => node_height_approx(has_image) / 2
export function offset_input_by_half_node (point: CanvasPoint): CanvasPoint
{
    return { left: point.left - half_node_width, top: point.top - half_node_height(false) }
}



export function offset_entry_by_half_node (kv_entry: KnowledgeViewWComponentEntry, has_image: boolean): CanvasPoint
{
    const s = kv_entry.s ?? 1
    const left = kv_entry.left + (s * half_node_width)
    const top = kv_entry.top + (s * half_node_height(has_image))

    return { left, top }
}
