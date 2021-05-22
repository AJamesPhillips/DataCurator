import { pub_sub_factory } from "../pub_sub/pub_sub_factory"



export interface CanvasPointerEvent
{
    x: number
    y: number
}



interface CanvasMsgMap
{
    canvas_double_tap: CanvasPointerEvent
    canvas_right_click: CanvasPointerEvent
}

export const canvas_pub_sub = pub_sub_factory<CanvasMsgMap>()

// canvas_pub_sub.sub("canvas_double_tap", (msg: CanvasPointerEvent) =>
// {
//     console.log("got double tap")
// })
// canvas_pub_sub.sub("canvas_right_click", (msg: CanvasPointerEvent) =>
// {
//     console.log("got right click")
// })

// canvas_pub_sub.pub("canvas_double_tap", { x: 1, y: 1, ms: 1 })
// canvas_pub_sub.pub("canvas_right_click", { x: 1, y: 1, ms: 1 })
