import { h } from "preact"
import { MutableRef, useMemo, useRef, useState } from "preact/hooks"

import "./CanvasConnection.scss"
import type { ConnectionLineBehaviour } from "../../wcomponent/interfaces/SpecialisedObjects"
import { ConnectionEndType, ConnectionEnd } from "./ConnectionEnd"
import { bounded } from "../../shared/utils/bounded"
import { ConnectionTerminus } from "./terminal"
import { ConnectionCoords, derive_connection_coords, DeriveConnectionCoordsArgs } from "./derive_coords"
import { Vector } from "./utils"



interface OwnProps {
    connection_from_component: ConnectionTerminus | undefined
    connection_to_component: ConnectionTerminus | undefined
    hidden?: boolean
    line_behaviour: ConnectionLineBehaviour | undefined
    circular_links: boolean
    thickness?: number
    intensity?: number
    blur?: number
    connection_end_type?: ConnectionEndType
    is_highlighted?: boolean
    focused_mode?: boolean
    on_click?: (e: h.JSX.TargetedEvent<SVGGElement, PointerEvent>) => void
    on_pointer_over_out?: (over: boolean) => void
    extra_css_classes?: string
}



export function CanvasConnection (props: OwnProps)
{
    const [hovered, set_hovered] = useState(false)
    const current_connection_coords = useRef<ConnectionCoordsWithProgress | undefined>(undefined)
    const path_background = useRef<SVGPathElement | undefined>(undefined)
    const animate_to_target_timeout = useRef<NodeJS.Timeout | undefined>(undefined)


    const {
        connection_from_component, connection_to_component,
        line_behaviour, circular_links,
        on_pointer_over_out = () => {},
        connection_end_type = ConnectionEndType.positive,
    } = props

    const thickness = hovered ? 2 : (props.thickness ?? 2)
    const end_size = bounded(thickness * 2.5, 10, 35)


    const target_connection_coords: ConnectionCoordsWithProgress | null = useMemo(() =>
    {
        const connection_coords = derive_connection_coords({
            connection_from_component,
            connection_to_component,
            line_behaviour,
            circular_links,
            end_size,
            connection_end_type
        })
        if (!connection_coords) return null

        return {
            ...connection_coords,
            progress: 0,
        }
    }, [
        connection_from_component, connection_to_component,
        line_behaviour, circular_links, end_size, connection_end_type,
    ])

    if (!target_connection_coords) return null


    let opacity = props.intensity ?? 1

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


    const d_args = (current_connection_coords.current || target_connection_coords)


    return <g
        className={"connection_container " + (props.extra_css_classes || "")}
        onPointerDown={props.on_click}
        style={{ display: props.hidden ? "none" : "" }}
    >
        <path
            className={"connection_line_background " + extra_background_classes}
            d={calc_d(d_args)}
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
                if (!path) return

                if (animate_to_target_timeout.current) clearTimeout(animate_to_target_timeout.current)
                const path_background_el = (hovered || props.is_highlighted) ? path_background.current : undefined
                animate_to_target_timeout.current = animate_to_target(path, path_background_el, current_connection_coords, target_connection_coords)
            }}
            style={style_line}
        />

        <ConnectionEnd
            type={connection_end_type}
            x={target_connection_coords.connection_end_x}
            y={target_connection_coords.connection_end_y}
            end_angle={target_connection_coords.end_angle}
            opacity={opacity}
            blur={blur}
            size={end_size}
            is_hovered={hovered}
            is_highlighted={props.is_highlighted}
        />
    </g>
}



interface ConnectionCoordsWithProgress extends ConnectionCoords
{
    progress: number
}

interface DArgs
{
    line_start_x: number
    line_start_y: number
    relative_control_point1: Vector
    relative_control_point2: Vector
    line_end_x: number
    line_end_y: number
}
function calc_d ({ line_start_x, line_start_y, relative_control_point1, relative_control_point2, line_end_x, line_end_y }: DArgs)
{
    const cx1 = line_start_x + relative_control_point1.x
    const cy1 = -line_start_y - relative_control_point1.y
    const cx2 = line_end_x + relative_control_point2.x
    const cy2 = -line_end_y - relative_control_point2.y
    return `M ${line_start_x} ${-line_start_y} C ${cx1},${cy1}, ${cx2},${cy2}, ${line_end_x},${-line_end_y}`
}



const step_ms = 30
const animation_total_ms = 1 * 1000
const progress_step = step_ms / animation_total_ms
function animate_to_target (path: SVGPathElement, path_background: SVGPathElement | undefined, current_position: MutableRef<DArgs | undefined>, target_position: ConnectionCoordsWithProgress)
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
            relative_control_point1: tween_vector(current.relative_control_point1, target_position.relative_control_point1, progress),
            relative_control_point2: tween_vector(current.relative_control_point2, target_position.relative_control_point2, progress),
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

function tween_vector (a: Vector, b: Vector, progress: number): Vector
{
    return {
        x: tween(a.x, b.x, progress),
        y: tween(a.y, b.y, progress),
    }
}
