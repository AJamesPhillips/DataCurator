import { h } from "preact"
import { useEffect, useMemo, useState } from "preact/hooks"

import { bounded } from "../../shared/utils/bounded"
import { ConnectionLineBehaviour } from "../../wcomponent/interfaces/SpecialisedObjects"
import "./CanvasConnection.scss"
import { ConnectionEnd, ConnectionEndType } from "./ConnectionEnd"
import { ConnectionCoords, derive_connection_coords } from "./derive_coords"
import { ConnectionTerminus } from "./terminal"
import { Vector } from "./utils"



interface OwnProps {
    connection_from_component: ConnectionTerminus | undefined
    connection_to_component: ConnectionTerminus | undefined
    hidden?: boolean
    line_behaviour: ConnectionLineBehaviour | undefined
    circular_links: boolean
    thickness?: number
    opacity?: number
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

    const {
        connection_from_component, connection_to_component,
        line_behaviour, circular_links,
        on_pointer_over_out = () => {},
        connection_end_type = ConnectionEndType.positive,
        is_highlighted = false,
    } = props

    const thickness = hovered ? 2 : (props.thickness ?? 2)
    const end_size = bounded(thickness * 2.5, 10, 35)


    const target_connection_coords: ConnectionCoords | null = useMemo(() =>
    {
        return derive_connection_coords({
            connection_from_component,
            connection_to_component,
            line_behaviour,
            circular_links,
            end_size,
            connection_end_type
        })
    }, [
        connection_from_component, connection_to_component,
        line_behaviour, circular_links, end_size, connection_end_type,
    ])

    if (!target_connection_coords) return null

    const opacity = props.opacity ?? 1
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
            : (is_highlighted ? " highlighted " : ""))
    const extra_background_classes = (props.on_click ? " mouseable " : "") + extra_line_classes


    const on_pointer_over = () =>
    {
        set_hovered(true)
        on_pointer_over_out(true)
    }
    const on_pointer_out = () =>
    {
        set_hovered(false)
        on_pointer_over_out(false)
    }

    return <g
        className={"connection_container " + (props.extra_css_classes || "")}
        onPointerDown={props.on_click}
        style={{ display: props.hidden ? "none" : "" }}
    >
        <CanvasConnectionVisual
            target_connection_coords={target_connection_coords}
            extra_background_classes={extra_background_classes}
            on_pointer_over={on_pointer_over}
            on_pointer_out={on_pointer_out}
            style_line_background={style_line_background}
            extra_line_classes={extra_line_classes}
            style_line={style_line}
            connection_end_type={connection_end_type}
            opacity={opacity}
            blur={blur}
            end_size={end_size}
            hovered={hovered}
            is_highlighted={is_highlighted}
            line_behaviour={line_behaviour}
        />
    </g>
}



interface CanvasConnectionVisualProps
{
    target_connection_coords: ConnectionCoords

    extra_background_classes: string
    on_pointer_over: () => void
    on_pointer_out: () => void
    style_line_background: h.JSX.CSSProperties

    extra_line_classes: string
    style_line: h.JSX.CSSProperties

    connection_end_type: ConnectionEndType
    opacity: number
    blur: number
    end_size: number
    hovered: boolean
    is_highlighted: boolean

    line_behaviour: ConnectionLineBehaviour | undefined
}
function CanvasConnectionVisual(props: CanvasConnectionVisualProps)
{
    const [current_connection_coords, set_current_connection_coords] = useState<ConnectionCoords>(props.target_connection_coords)

    useEffect(() =>
    {
        return animate_to_target(
            current_connection_coords,
            props.target_connection_coords,
            set_current_connection_coords
        )
    }, [props.target_connection_coords])

    const d = calc_d(current_connection_coords, props.line_behaviour)

    return <>
        <path
            className={"connection_line_background " + props.extra_background_classes}
            d={d}
            onPointerOver={props.on_pointer_over}
            onPointerOut={props.on_pointer_out}
            style={props.style_line_background}
        />
        <path
            className={"connection_line " + props.extra_line_classes}
            d={d}
            style={props.style_line}
        />

        <ConnectionEnd
            type={props.connection_end_type}
            x={current_connection_coords.connection_end_x}
            y={current_connection_coords.connection_end_y}
            end_angle={current_connection_coords.end_angle}
            opacity={props.opacity}
            blur={props.blur}
            size={props.end_size}
            is_hovered={props.hovered}
            is_highlighted={props.is_highlighted}
        />
    </>
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
// https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d
function calc_d ({ line_start_x, line_start_y, relative_control_point1, relative_control_point2, line_end_x, line_end_y }: DArgs, line_behaviour: ConnectionLineBehaviour | undefined)
{
    if (line_behaviour === ConnectionLineBehaviour.angular)
    {
        const half_height = (line_end_y - line_start_y) / 2

        return `
            M ${line_start_x} ${-line_start_y}
            L ${line_start_x} ${-line_start_y - half_height}
            L ${line_end_x} ${-line_start_y - half_height}
            L ${line_end_x} ${-line_end_y}
        `
    }

    const cx1 = line_start_x + relative_control_point1.x
    const cy1 = -line_start_y - relative_control_point1.y
    const cx2 = line_end_x + relative_control_point2.x
    const cy2 = -line_end_y - relative_control_point2.y
    return `
        M ${line_start_x} ${-line_start_y}
        C ${cx1},${cy1}, ${cx2},${cy2}, ${line_end_x},${-line_end_y}
    `
}



const ANIMATION_TOTAL_MS = 1 * 1000
function animate_to_target (current: ConnectionCoords, target: ConnectionCoords, set_current_connection_coords: (new_coords: ConnectionCoords) => void)
{
    if (current === target) return

    let start_time = performance.now()

    function advance (time: DOMHighResTimeStamp)
    {
        if (start_time < 0) return // animation is cancelled or finished

        let progress = (time - start_time) / ANIMATION_TOTAL_MS
        progress = Math.min(progress, 1)

        const intermediate: ConnectionCoords = {
            line_start_x: tween(current.line_start_x, target.line_start_x, progress),
            line_start_y: tween(current.line_start_y, target.line_start_y, progress),
            relative_control_point1: tween_vector(current.relative_control_point1, target.relative_control_point1, progress),
            relative_control_point2: tween_vector(current.relative_control_point2, target.relative_control_point2, progress),
            line_end_x: tween(current.line_end_x, target.line_end_x, progress),
            line_end_y: tween(current.line_end_y, target.line_end_y, progress),

            connection_end_x: tween(current.connection_end_x, target.connection_end_x, progress),
            connection_end_y: tween(current.connection_end_y, target.connection_end_y, progress),
            end_angle: tween(current.end_angle, target.end_angle, progress),
        }

        if (progress >= 1)
        {
            start_time = -1
            set_current_connection_coords(target)
        }
        else
        {
            set_current_connection_coords(intermediate)
            requestAnimationFrame(advance)
        }
    }
    requestAnimationFrame(advance)

    return () => start_time = -1
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
