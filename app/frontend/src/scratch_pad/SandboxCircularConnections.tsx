import { h } from "preact"
import { useState } from "preact/hooks"

import { ConnectableCanvasNode } from "../canvas/ConnectableCanvasNode"
import { CanvasConnnection } from "../canvas/connections/CanvasConnnection"



const origin_left = 500
const origin_top = 300
const origin = { left: origin_left, top: origin_top }

export function SandboxCircularConnections ()
{
    const [x, set_x] = useState(700)
    const [y, set_y] = useState(100)

    const node_2_position = { left: x, top: y }
    const circular_links = true

    return <div
        style={{ width: "100%", height: "100%" }}
        onMouseMove={e =>
        {
            set_x(e.x)
            set_y(e.y)
        }}
    >
        <ConnectableCanvasNode
            node_main_content={<div style={{ height: 100 }}>Node 1</div>}
            terminals={[]}
            position={origin}
        />
        <ConnectableCanvasNode
            node_main_content={<div style={{ height: 100 }}>Node 2</div>}
            terminals={[]}
            position={node_2_position}
        />

        <svg width={1300} height={1000} style={{ zIndex: 1000, position: "absolute" }}>
            <CanvasConnnection
                from_node_position={origin}
                from_connection_type={{ direction: "from", attribute: "state" }}
                to_node_position={node_2_position}
                to_connection_type={{ direction: "to", attribute: "state" }}
                circular_links={circular_links}
                should_animate={false}
            />
            <CanvasConnnection
                from_node_position={node_2_position}
                from_connection_type={{ direction: "from", attribute: "state" }}
                to_node_position={origin}
                to_connection_type={{ direction: "to", attribute: "state" }}
                circular_links={circular_links}
                should_animate={false}
            />
        </svg>

    </div>
}
