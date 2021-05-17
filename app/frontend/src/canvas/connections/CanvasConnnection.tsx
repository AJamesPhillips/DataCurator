import { h } from "preact"

import "./connection.css"
import type { ConnectionLocationType } from "../../shared/models/interfaces/SpecialisedObjects"
import { _get_connection_point } from "../ConnectableCanvasNode"
import type { CanvasPoint } from "../interfaces"
import { ConnectionEnd } from "./ConnectionEnd"
import { derive_coords } from "./derive_coords"



interface OwnProps {
    from_node_position: CanvasPoint | undefined
    to_node_position: CanvasPoint | undefined
    from_connection_location: ConnectionLocationType
    to_connection_location: ConnectionLocationType
    hidden?: boolean
    intensity?: number
    blur?: number
    is_highlighted?: boolean
    on_click?: () => void
}


export function CanvasConnnection (props: OwnProps)
{
    const { from_node_position, to_node_position, from_connection_location, to_connection_location } = props
    if (!from_node_position || !to_node_position) return null

    const { x1, y1, x2, y2, control_point1, control_point2, end_angle } = derive_coords({
        from_node_position, to_node_position, from_connection_location, to_connection_location
    })

    const intensity_weighting = 0.8
    const intensity = props.intensity === undefined ? 1 : props.intensity
    const opacity = (intensity * intensity_weighting) + (1 - intensity_weighting)

    const blur = props.blur || 0

    const style_line: h.JSX.CSSProperties = {
        strokeOpacity: opacity,
        filter: `url(#blur_filter_${Math.round(blur)})`,
    }

    const extra_classes = (props.on_click ? " mouseable " : "") + (props.is_highlighted ? " highlighted " : "")

    return <g className="connection" onClick={props.on_click} style={{ display: props.hidden ? "none" : "" }}>
        <path
            className={"connection_line " + extra_classes}
            d={`M ${x1} ${-y1} C ${x1 + control_point1.x} ${-y1 - control_point1.y}, ${x2 + control_point2.x} ${-y2 - control_point2.y}, ${x2} ${-y2}`}
            style={style_line}
        />

        <ConnectionEnd
            x={x2}
            y={y2}
            end_angle={end_angle}
            opacity={opacity}
            blur={blur}
            is_highlighted={props.is_highlighted}
        />
    </g>
}
