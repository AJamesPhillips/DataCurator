import { h } from "preact"

import "./CanvasConnnection.css"
import type { ConnectionTerminalType } from "../../shared/wcomponent/interfaces/SpecialisedObjects"
import type { CanvasPoint } from "../interfaces"
import { ConnectionEnd, ConnectionEndType } from "./ConnectionEnd"
import { derive_coords } from "./derive_coords"
import { useState } from "preact/hooks"



interface OwnProps {
    from_node_position: CanvasPoint | undefined
    to_node_position: CanvasPoint | undefined
    from_connection_type: ConnectionTerminalType
    to_connection_type: ConnectionTerminalType
    hidden?: boolean
    intensity?: number
    blur?: number
    is_highlighted?: boolean
    on_pointer_down?: (e: h.JSX.TargetedEvent<SVGGElement, PointerEvent>) => void
    extra_css_classes?: string
}


export function CanvasConnnection (props: OwnProps)
{
    const [hovered, set_hovered] = useState(false)
    const [fade_inout_opacity, set_fade_inout_opacity] = useState(0)


    const { from_node_position, to_node_position, from_connection_type, to_connection_type } = props
    if (!from_node_position || !to_node_position) return null

    const { x1, y1, x2, y2, control_point1, control_point2, end_angle } = derive_coords({
        from_node_position, to_node_position, from_connection_type, to_connection_type
    })


    let opacity = props.intensity === undefined ? 1 : props.intensity
    if (opacity !== undefined)
    {
        if (fade_inout_opacity < opacity)
        {
            const new_opacity = Math.min(fade_inout_opacity + 0.1, opacity)
            setTimeout(() => set_fade_inout_opacity(new_opacity), 30)
        }
        opacity = fade_inout_opacity
    }


    const blur = props.blur || 0

    const style_line: h.JSX.CSSProperties = {
        strokeOpacity: opacity,
        filter: `url(#blur_filter_${Math.round(blur)})`,
    }

    const extra_line_classes = `${hovered ? "hovered" : (props.is_highlighted ? "highlighted" : "")}`
    const extra_background_classes = (props.on_pointer_down ? " mouseable " : "") + extra_line_classes


    return <g
        className={"connection_container " + (props.extra_css_classes || "")}
        onPointerDown={props.on_pointer_down}
        style={{ display: props.hidden ? "none" : "" }}
    >
        <path
            className={"connection_line_background " + extra_background_classes}
            d={`M ${x1} ${-y1} C ${x1 + control_point1.x},${-y1 - control_point1.y}, ${x2 + control_point2.x},${-y2 - control_point2.y}, ${x2},${-y2}`}
            onPointerOver={() => set_hovered(true)}
            onPointerOut={() => set_hovered(false)}
        />
        <path
            className={"connection_line " + extra_line_classes}
            d={`M ${x1} ${-y1} C ${x1 + control_point1.x},${-y1 - control_point1.y}, ${x2 + control_point2.x},${-y2 - control_point2.y}, ${x2},${-y2}`}
            style={style_line}
        />

        <ConnectionEnd
            type={ConnectionEndType.positive}
            x={x2}
            y={y2}
            end_angle={end_angle}
            opacity={opacity}
            blur={blur}
            is_hovered={hovered}
            is_highlighted={props.is_highlighted}
        />
    </g>
}
