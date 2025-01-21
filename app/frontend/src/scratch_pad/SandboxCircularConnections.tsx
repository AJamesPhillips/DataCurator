import { useState } from "preact/hooks"

import { ConnectableCanvasNode } from "../canvas/ConnectableCanvasNode"
import { CanvasConnection } from "../canvas/connections/CanvasConnection"
import { ConnectionTerminus } from "../canvas/connections/terminal"
import { ConnectionLineBehaviour } from "../wcomponent/interfaces/SpecialisedObjects"



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
        kv_wc_entry: origin,
        wcomponent_type: "statev2",
        connection_terminal_type: { side: "right", attribute: "state" },
    }

    const connection_to_component: ConnectionTerminus = {
        kv_wc_entry: origin,
        wcomponent_type: "statev2",
        connection_terminal_type: { side: "left", attribute: "state" },
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
                    connection_to_component={{ ...connection_to_component, kv_wc_entry: node_2_position }}
                    line_behaviour={ConnectionLineBehaviour.curve}
                    circular_links={true}
                />
                <CanvasConnection
                    connection_from_component={{ ...connection_from_component, kv_wc_entry: node_2_position }}
                    connection_to_component={connection_to_component}
                    line_behaviour={ConnectionLineBehaviour.curve}
                    circular_links={true}
                />
            </g>}

            {non_circular_links && <g>
                <CanvasConnection
                    connection_from_component={connection_from_component}
                    connection_to_component={{ ...connection_to_component, kv_wc_entry: node_2_position }}
                    line_behaviour={ConnectionLineBehaviour.curve}
                    circular_links={false}
                />
                <CanvasConnection
                    connection_from_component={{ ...connection_from_component, kv_wc_entry: node_2_position }}
                    connection_to_component={connection_to_component}
                    line_behaviour={ConnectionLineBehaviour.curve}
                    circular_links={false}
                />
            </g>}
        </svg>

    </div>
}
