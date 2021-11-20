import { h } from "preact"
import { Ref, useMemo, useRef, useState } from "preact/hooks"

import "./CanvasConnnection.css"
import type { KnowledgeViewWComponentEntry } from "../../shared/interfaces/knowledge_view"
import type { ConnectionLineBehaviour, ConnectionTerminalType } from "../../wcomponent/interfaces/SpecialisedObjects"
import { ConnectionEndType, ConnectionEnd } from "./ConnectionEnd"
import { derive_coords } from "./derive_coords"
import type { Position } from "../interfaces"



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
    on_click?: (e: h.JSX.TargetedEvent<SVGGElement, PointerEvent>) => void
    on_pointer_over_out?: (over: boolean) => void
    extra_css_classes?: string
}


export function CanvasConnnection (props: OwnProps)
{
    const [hovered, set_hovered] = useState(false)
    const target_position = useRef<DArgs | undefined>(undefined)


    const {
        from_node_position, to_node_position, from_connection_type, to_connection_type,
        line_behaviour,
        on_pointer_over_out = () => {},
    } = props
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
    const extra_background_classes = (props.on_click ? " mouseable " : "") + extra_line_classes


    const new_target: DArgs = useMemo(() => ({
        x1,
        y1,
        relative_control_point_x1: relative_control_point1.x,
        relative_control_point_y1: relative_control_point1.y,
        relative_control_point_x2: relative_control_point2.x,
        relative_control_point_y2: relative_control_point2.y,
        x2,
        y2,
    }), [x1, y1, relative_control_point1.x, relative_control_point1.y, relative_control_point2.x, relative_control_point2.y, x2, y2])
    const d_args = target_position.current || new_target


    return <g
        className={"connection_container " + (props.extra_css_classes || "")}
        onPointerDown={props.on_click}
        style={{ display: props.hidden ? "none" : "" }}
    >
        <path
            className={"connection_line_background " + extra_background_classes}
            d={calc_d(new_target)}
            onPointerOver={() =>
            {
                set_hovered(true)
                on_pointer_over_out(true)
            }}
            onPointerOut={() =>
            {
                set_hovered(false)
                on_pointer_over_out(false)
            }}
            style={style_line_background}
        />
        <path
            className={"connection_line " + extra_line_classes}
            d={calc_d(d_args)}
            ref={e =>
            {
                if (!e) return
                // todo capture setInterval so we can cancel it
                move_to_target(e, target_position, new_target)
            }}
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



interface DArgs
{
    x1: number
    y1: number
    relative_control_point_x1: number
    relative_control_point_y1: number
    relative_control_point_x2: number
    relative_control_point_y2: number
    x2: number
    y2: number
}
function calc_d ({ x1, y1, relative_control_point_x1, relative_control_point_y1, relative_control_point_x2, relative_control_point_y2, x2, y2 }: DArgs)
{
    const cx1 = x1 + relative_control_point_x1
    const cy1 = -y1 - relative_control_point_y1
    const cx2 = x2 + relative_control_point_x2
    const cy2 = -y2 - relative_control_point_y2
    return `M ${x1} ${-y1} C ${cx1},${cy1}, ${cx2},${cy2}, ${x2},${-y2}`
}



function move_to_target (e: SVGPathElement, target_position: Ref<DArgs | undefined>, new_target: DArgs)
{
    const _current = target_position.current
    if (_current === undefined)
    {
        target_position.current = new_target
        return
    }
    else if (target_position.current === new_target) return
    const current = _current // type guard


    let progress = 0
    let timeout: NodeJS.Timeout | undefined = undefined

    function advance ()
    {
        progress += 0.1
        progress = Math.min(progress, 1) // defensive

        const intermediate: DArgs = {
            x1: tween(current.x1, new_target.x1, progress),
            y1: tween(current.y1, new_target.y1, progress),
            relative_control_point_x1: tween(current.relative_control_point_x1, new_target.relative_control_point_x1, progress),
            relative_control_point_y1: tween(current.relative_control_point_y1, new_target.relative_control_point_y1, progress),
            relative_control_point_x2: tween(current.relative_control_point_x2, new_target.relative_control_point_x2, progress),
            relative_control_point_y2: tween(current.relative_control_point_y2, new_target.relative_control_point_y2, progress),
            x2: tween(current.x2, new_target.x2, progress),
            y2: tween(current.y2, new_target.y2, progress),
        }
        const d = calc_d(intermediate)
        e.setAttribute("d", d)

        if (progress >= 1)
        {
            if (timeout) clearTimeout(timeout)
            target_position.current = new_target
        }
    }

    timeout = setInterval(advance, 20)
}



function tween (a: number, b: number, progress: number)
{
    return a + ((b - a) * progress)
}
