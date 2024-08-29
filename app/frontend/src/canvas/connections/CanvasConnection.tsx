import { h } from "preact"
import { MutableRef, useMemo, useRef, useState } from "preact/hooks"

import "./CanvasConnection.scss"
import type { KnowledgeViewWComponentEntry } from "../../shared/interfaces/knowledge_view"
import type { ConnectionLineBehaviour, ConnectionTerminalType } from "../../wcomponent/interfaces/SpecialisedObjects"
import { ConnectionEndType, ConnectionEnd } from "./ConnectionEnd"
import { derive_connection_coords, DeriveConnectionCoordsArgs, WComponentConnectionData } from "./derive_coords"
import { bounded } from "../../shared/utils/bounded"
import { WComponentType } from "../../wcomponent/interfaces/wcomponent_base"



interface OwnProps {
    from_node_position: KnowledgeViewWComponentEntry | undefined
    to_node_position: KnowledgeViewWComponentEntry | undefined
    from_wcomponent_type: WComponentType | undefined
    to_wcomponent_type: WComponentType | undefined
    from_connection_type: ConnectionTerminalType
    to_connection_type: ConnectionTerminalType
    hidden?: boolean
    line_behaviour?: ConnectionLineBehaviour
    circular_links?: boolean
    thickness?: number
    intensity?: number
    blur?: number
    connection_end_type?: ConnectionEndType
    is_highlighted?: boolean
    focused_mode?: boolean
    on_click?: (e: h.JSX.TargetedEvent<SVGGElement, PointerEvent>) => void
    on_pointer_over_out?: (over: boolean) => void
    extra_css_classes?: string
    should_animate?: boolean
}



export function CanvasConnection (props: OwnProps)
{
    const [hovered, set_hovered] = useState(false)
    const current_position = useRef<DArgsWithProgress | undefined>(undefined)
    const path_background = useRef<SVGPathElement | undefined>(undefined)
    const animate_to_target_timeout = useRef<NodeJS.Timeout | undefined>(undefined)


    const {
        from_node_position, to_node_position,
        from_wcomponent_type, to_wcomponent_type,
        from_connection_type, to_connection_type,
        line_behaviour, circular_links,
        on_pointer_over_out = () => {},
        should_animate = true,
        connection_end_type = ConnectionEndType.positive,
    } = props
    if (!from_node_position && !to_node_position) return null



    let opacity = props.intensity ?? 1
    const thickness = hovered ? 2 : (props.thickness ?? 2)
    const end_size = bounded(thickness * 2.5, 10, 35)
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


    const blur = props.blur ?? 0

    const style_line_background: h.JSX.CSSProperties = {
        strokeWidth: thickness + 10,
    }

    const style_line: h.JSX.CSSProperties = {
        strokeOpacity: opacity,
        strokeWidth: thickness,
        filter: blur ? `url(#blur_filter_${Math.round(blur)})` : "",
    }

    const extra_line_classes = hovered ? " hovered "
        : (props.focused_mode
            ? "" // hide the background when in focused_mode
            : (props.is_highlighted ? " highlighted " : ""))
    const extra_background_classes = (props.on_click ? " mouseable " : "") + extra_line_classes


    const result = useMemo(() =>
    {
        const from_node_data: WComponentConnectionData | undefined = (from_node_position && from_wcomponent_type) ? {
            position: from_node_position,
            type: from_wcomponent_type,
            connection_type: from_connection_type,
        } : undefined

        const to_node_data: WComponentConnectionData | undefined = (to_node_position && to_wcomponent_type) ? {
            position: to_node_position,
            type: to_wcomponent_type,
            connection_type: to_connection_type,
        } : undefined

        const fudged_end_size = end_size / 10

        let derived_connection_coords_args: DeriveConnectionCoordsArgs
        if (!from_node_data)
        {
            if (!to_node_data) return null
            derived_connection_coords_args = {
                from_node_data,
                to_node_data,
                line_behaviour,
                circular_links,
                end_size: fudged_end_size,
                connection_end_type,
            }
        }
        else
        {
            derived_connection_coords_args = {
                from_node_data,
                to_node_data,
                line_behaviour,
                circular_links,
                end_size: fudged_end_size,
                connection_end_type,
            }
        }

        const {
            line_start_x,
            line_start_y,
            connection_end_x,
            connection_end_y,
            line_end_x,
            line_end_y,
            relative_control_point1,
            relative_control_point2,
            end_angle,
        } = derive_connection_coords(derived_connection_coords_args)

        const target_position: DArgsWithProgress = {
            line_start_x,
            line_start_y,
            relative_control_point_x1: relative_control_point1.x,
            relative_control_point_y1: relative_control_point1.y,
            relative_control_point_x2: relative_control_point2.x,
            relative_control_point_y2: relative_control_point2.y,
            line_end_x,
            line_end_y,
            progress: 0,
        }

        return { connection_end_x, connection_end_y, end_angle, target_position }
    }, [
        from_node_position, to_node_position,
        from_wcomponent_type, to_wcomponent_type,
        from_connection_type, to_connection_type,
        line_behaviour, circular_links, end_size, connection_end_type,
    ])

    if (!result) return null
    const { connection_end_x, connection_end_y, end_angle, target_position } = result

    const d_args = should_animate ? (current_position.current || target_position) : target_position


    return <g
        className={"connection_container " + (props.extra_css_classes || "")}
        onPointerDown={props.on_click}
        style={{ display: props.hidden ? "none" : "" }}
    >
        <path
            className={"connection_line_background " + extra_background_classes}
            d={calc_d(target_position)}
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
            ref={e => path_background.current = e || undefined}
        />
        <path
            className={"connection_line " + extra_line_classes}
            d={calc_d(d_args)}
            ref={path =>
            {
                if (!path || !should_animate) return

                if (animate_to_target_timeout.current) clearTimeout(animate_to_target_timeout.current)
                const path_background_el = (hovered || props.is_highlighted) ? path_background.current : undefined
                animate_to_target_timeout.current = animate_to_target(path, path_background_el, current_position, target_position)
            }}
            style={style_line}
        />

        <ConnectionEnd
            type={connection_end_type}
            x={connection_end_x}
            y={connection_end_y}
            end_angle={end_angle}
            opacity={opacity}
            blur={blur}
            size={end_size}
            is_hovered={hovered}
            is_highlighted={props.is_highlighted}
        />
    </g>
}



interface DArgsWithProgress extends DArgs
{
    progress: number
}

interface DArgs
{
    line_start_x: number
    line_start_y: number
    relative_control_point_x1: number
    relative_control_point_y1: number
    relative_control_point_x2: number
    relative_control_point_y2: number
    line_end_x: number
    line_end_y: number
}
function calc_d ({ line_start_x, line_start_y, relative_control_point_x1, relative_control_point_y1, relative_control_point_x2, relative_control_point_y2, line_end_x, line_end_y }: DArgs)
{
    const cx1 = line_start_x + relative_control_point_x1
    const cy1 = -line_start_y - relative_control_point_y1
    const cx2 = line_end_x + relative_control_point_x2
    const cy2 = -line_end_y - relative_control_point_y2
    return `M ${line_start_x} ${-line_start_y} C ${cx1},${cy1}, ${cx2},${cy2}, ${line_end_x},${-line_end_y}`
}



const step_ms = 30
const animation_total_ms = 1 * 1000
const progress_step = step_ms / animation_total_ms
function animate_to_target (path: SVGPathElement, path_background: SVGPathElement | undefined, current_position: MutableRef<DArgs | undefined>, target_position: DArgsWithProgress)
{
    if (current_position.current === undefined || current_position.current === target_position)
    {
        target_position.progress = 1
        current_position.current = target_position
        return
    }
    const current = current_position.current


    let timeout: NodeJS.Timeout | undefined = undefined

    function advance ()
    {
        let progress = target_position.progress + progress_step
        progress = Math.min(progress, 1) // defensive
        target_position.progress = progress

        const intermediate: DArgs = {
            line_start_x: tween(current.line_start_x, target_position.line_start_x, progress),
            line_start_y: tween(current.line_start_y, target_position.line_start_y, progress),
            relative_control_point_x1: tween(current.relative_control_point_x1, target_position.relative_control_point_x1, progress),
            relative_control_point_y1: tween(current.relative_control_point_y1, target_position.relative_control_point_y1, progress),
            relative_control_point_x2: tween(current.relative_control_point_x2, target_position.relative_control_point_x2, progress),
            relative_control_point_y2: tween(current.relative_control_point_y2, target_position.relative_control_point_y2, progress),
            line_end_x: tween(current.line_end_x, target_position.line_end_x, progress),
            line_end_y: tween(current.line_end_y, target_position.line_end_y, progress),
        }
        const d = calc_d(intermediate)
        path.setAttribute("d", d)
        path_background?.setAttribute("d", d)

        if (progress >= 1)
        {
            if (timeout) clearTimeout(timeout)
            current_position.current = target_position
        }
    }

    timeout = setInterval(advance, step_ms)
    return timeout
}



function tween (a: number, b: number, progress: number)
{
    return a + ((b - a) * progress)
}
