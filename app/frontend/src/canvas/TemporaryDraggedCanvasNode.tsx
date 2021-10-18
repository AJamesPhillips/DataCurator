import { h } from "preact"
import { useEffect, useState } from "preact/hooks"

import { pub_sub } from "../state/pub_sub/pub_sub"
import { ConnectableCanvasNode } from "./ConnectableCanvasNode"
import type { CanvasPoint } from "./interfaces"



export function TemporaryDraggedCanvasNode ()
{
    const [size, set_size] = useState<{ width: number; height: number } | undefined>(undefined)
    const [position, set_position] = useState<CanvasPoint | undefined>(undefined)

    useEffect(() =>
    {
        const unsubscribe_size = pub_sub.canvas.sub("canvas_node_drag_size", new_size =>
        {
            set_size(new_size)
        })

        const unsubscribe_position = pub_sub.canvas.sub("canvas_node_drag_position", new_position =>
        {
            set_position(new_position)
        })

        return () =>
        {
            unsubscribe_size()
            unsubscribe_position()
        }
    })


    if (!position) return null

    const { width, height } = size || {}
    console.log(size)

    return <ConnectableCanvasNode
        position={position}
        extra_css_class="temporary_dragged_canvas_node"
        node_main_content={<div style={{ width, height }} />}
        terminals={[]}
    />
}
