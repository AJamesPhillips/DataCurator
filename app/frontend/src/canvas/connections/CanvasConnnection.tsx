import { h } from "preact"
import { useState } from "preact/hooks"

import "./CanvasConnnection.css"
import type { KnowledgeViewWComponentEntry } from "../../shared/interfaces/knowledge_view"
import type { ConnectionLineBehaviour, ConnectionTerminalType } from "../../wcomponent/interfaces/SpecialisedObjects"
import { ConnectionEndType, ConnectionEnd } from "./ConnectionEnd"
import { derive_coords } from "./derive_coords"



interface OwnProps {
    from_node_position: KnowledgeViewWComponentEntry | undefined
    to_node_position: KnowledgeViewWComponentEntry | undefined
    from_connection_type: ConnectionTerminalType
    to_connection_type: ConnectionTerminalType
    hidden?: boolean
    line_behaviour?: ConnectionLineBehaviour
    thickness?: number
    intensity?: number
    blur?: number
    connection_end_type?: ConnectionEndType
    is_highlighted?: boolean
    on_pointer_down?: (e: h.JSX.TargetedEvent<SVGGElement, PointerEvent>) => void
    extra_css_classes?: string
}


export function CanvasConnnection (props: OwnProps)
{
    const [hovered, set_hovered] = useState(false)
    // const [fade_inout_opacity, set_fade_inout_opacity] = useState(0)


    const { from_node_position, to_node_position, from_connection_type, to_connection_type, line_behaviour } = props
    if (!from_node_position || !to_node_position) return null

    const { x1, y1, x2, y2, relative_control_point1, relative_control_point2, end_angle } = derive_coords({
        from_node_position, to_node_position, from_connection_type, to_connection_type,
        line_behaviour,
    })


    let opacity = props.intensity === undefined ? 1 : props.intensity
    const thickness = hovered ? 2 : (props.thickness === undefined ? 2 : props.thickness)
    // Disabled as not performant at the moment
    // if (opacity !== undefined)
    // {
    //     if (fade_inout_opacity < opacity)
    //     {
    //         const new_opacity = Math.min(fade_inout_opacity + 0.1, opacity)
    //         setTimeout(() => set_fade_inout_opacity(new_opacity), 30)
    //     }
    //     opacity = fade_inout_opacity
    // }


    const blur = props.blur || 0

    const style_line_background: h.JSX.CSSProperties = {
        strokeWidth: thickness + 10,
    }

    const style_line: h.JSX.CSSProperties = {
        strokeOpacity: opacity,
        strokeWidth: thickness,
        filter: blur ? `url(#blur_filter_${Math.round(blur)})` : "",
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
            d={`M ${x1} ${-y1} C ${x1 + relative_control_point1.x},${-y1 - relative_control_point1.y}, ${x2 + relative_control_point2.x},${-y2 - relative_control_point2.y}, ${x2},${-y2}`}
            onPointerOver={() => set_hovered(true)}
            onPointerOut={() => set_hovered(false)}
            style={style_line_background}
        />
        <path
            className={"connection_line " + extra_line_classes}
            d={`M ${x1} ${-y1} C ${x1 + relative_control_point1.x},${-y1 - relative_control_point1.y}, ${x2 + relative_control_point2.x},${-y2 - relative_control_point2.y}, ${x2},${-y2}`}
            style={style_line}
        />

        <ConnectionEnd
            type={props.connection_end_type || ConnectionEndType.positive}
            x={x2}
            y={y2}
            end_angle={end_angle}
            opacity={opacity}
            blur={blur}
            size={thickness / 2}
            is_hovered={hovered}
            is_highlighted={props.is_highlighted}
        />
    </g>
}
