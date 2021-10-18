import { h } from "preact"
import { useEffect, useState } from "preact/hooks"

import { pub_sub } from "../state/pub_sub/pub_sub"
import { ConnectableCanvasNode } from "./ConnectableCanvasNode"
import type { CanvasPoint } from "./interfaces"



export function TemporaryDraggedCanvasNode ()
{
    const [position, set_position] = useState<CanvasPoint | undefined>(undefined)

    useEffect(() =>
    {
        const unsubscribe_position = pub_sub.canvas.sub("canvas_node_drag_relative_position", new_position =>
        {
            set_position(new_position)
        })

        return unsubscribe_position
    })


    return null
    // if (!position) return null

    // return <ConnectableCanvasNode
    //     position={position}
    //     extra_css_class="temporary_dragged_canvas_node"
    //     node_main_content={<div />}
    //     terminals={[]}
    // />
}
