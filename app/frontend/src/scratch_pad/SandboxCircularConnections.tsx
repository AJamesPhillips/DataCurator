import { useState } from "preact/hooks"

import { ConnectableCanvasNode } from "../canvas/ConnectableCanvasNode"
import { CanvasConnection } from "../canvas/connections/CanvasConnection"
import { ConnectionTerminus } from "../canvas/connections/terminal"



const origin_left = 500
const origin_top = 300
const origin = { left: origin_left, top: origin_top }

enum ShowLinkTypes
{
    both = 0,
    only_circular = 1,
    only_non_circular = 2,
}


export function SandboxCircularConnections ()
{
    const [x, set_x] = useState(700)
    const [y, set_y] = useState(100)
    const [show_link_types, set_show_link_types] = useState(ShowLinkTypes.both)
    const circular_links = show_link_types === ShowLinkTypes.both || show_link_types === ShowLinkTypes.only_circular
    const non_circular_links = show_link_types === ShowLinkTypes.both || show_link_types === ShowLinkTypes.only_non_circular

    const node_2_position = { left: x, top: y }

    const connection_from_component: ConnectionTerminus = {
        position: origin,
        wcomponent_type: "statev2",
        connection_terminal_type: { direction: "from", attribute: "state" },
    }

    const connection_to_component: ConnectionTerminus = {
        position: origin,
        wcomponent_type: "statev2",
        connection_terminal_type: { direction: "to", attribute: "state" },
    }

    return <div
        style={{ width: "100%", height: "100%" }}
        onMouseMove={e =>
        {
            set_x(e.x)
            set_y(e.y)
        }}
        onClick={() => set_show_link_types((show_link_types + 1) % 3)}
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
            {circular_links && <g>
                <CanvasConnection
                    connection_from_component={connection_from_component}
                    connection_to_component={{ ...connection_to_component, position: node_2_position }}
                    circular_links={true}
                    should_animate={false}
                />
                <CanvasConnection
                    connection_from_component={{ ...connection_from_component, position: node_2_position }}
                    connection_to_component={connection_to_component}
                    circular_links={true}
                    should_animate={false}
                />
            </g>}

            {non_circular_links && <g>
                <CanvasConnection
                    connection_from_component={connection_from_component}
                    connection_to_component={{ ...connection_to_component, position: node_2_position }}
                    circular_links={false}
                    should_animate={false}
                />
                <CanvasConnection
                    connection_from_component={{ ...connection_from_component, position: node_2_position }}
                    connection_to_component={connection_to_component}
                    circular_links={false}
                    should_animate={false}
                />
            </g>}
        </svg>

    </div>
}
