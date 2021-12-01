import { h } from "preact"
import { useEffect, useState } from "preact/hooks"
import { CanvasNode } from "../canvas/CanvasNode"
import type { CanvasPoint } from "../canvas/interfaces"
import { NODE_HEIGHT_APPROX, NODE_WIDTH } from "../canvas/position_utils"
import { pub_sub } from "../state/pub_sub/pub_sub"
import { position_from_canvas_pointer_event } from "../state/specialised_objects/subscribers/create_wcomponent_on_double_tap"
// import { WComponentCanvasNode } from "../wcomponent_canvas/node/WComponentCanvasNode"



export function WComponentCanvasNodeDebugCanvasPointerPosition ()
{
    const [position, set_position] = useState<CanvasPoint>({ left: 0, top: 0 })

    useEffect(() =>
    {
        const unsubscribe = pub_sub.canvas.sub("debug_canvas_move", point =>
        {
            const position = position_from_canvas_pointer_event(point)
            set_position(position)
        })

        return unsubscribe
    }, [])

    return <CanvasNode
        position={position}
        extra_styles={{ pointerEvents: "none" }}
    >
        <div style={{
            width: NODE_WIDTH,
            height: NODE_HEIGHT_APPROX,
            backgroundColor: "white",
        }}>
            Some text
        </div>
    </CanvasNode>
}
