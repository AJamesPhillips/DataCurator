import type { CanvasPoint } from "../../canvas/interfaces"
import { pub_sub_factory } from "../pub_sub/pub_sub_factory"



export interface CanvasPointerEvent
{
    x: number
    y: number
}


export interface CanvasAreaSelectEvent
{
    start_x: number
    start_y: number
    end_x: number
    end_y: number
}


interface CanvasMsgMap
{
    canvas_double_tap: CanvasPointerEvent
    canvas_right_click: CanvasPointerEvent
    canvas_area_select: CanvasAreaSelectEvent
    canvas_node_drag_wcomponent_ids: string[]
    canvas_node_drag_relative_position: CanvasPoint | undefined
}


export const canvas_pub_sub = pub_sub_factory<CanvasMsgMap>({
    canvas_node_drag_relative_position: canvas_node_drag_relative_position_middleware,
})



let last_node_drag_position: CanvasPoint | undefined = undefined
function canvas_node_drag_relative_position_middleware (message: CanvasPoint | undefined)
{
    const continue_ = (
        last_node_drag_position?.left !== message?.left
        || last_node_drag_position?.top !== message?.top
    )

    last_node_drag_position = message

    return { continue: continue_, message }
}

// canvas_pub_sub.sub("canvas_double_tap", (msg: CanvasPointerEvent) =>
// {
//     console. log("got double tap")
// })
// canvas_pub_sub.sub("canvas_right_click", (msg: CanvasPointerEvent) =>
// {
//     console. log("got right click")
// })

// canvas_pub_sub.pub("canvas_double_tap", { x: 1, y: 1, ms: 1 })
// canvas_pub_sub.pub("canvas_right_click", { x: 1, y: 1, ms: 1 })
