import { h } from "preact"

import { rads } from "../../utils/angles"
import type { Position } from "../interfaces"
import { add_vec, multiply_vec, to_vec } from "./utils"



export enum ConnectionEndType
{
    positive,
    negative,
    noop,
}

interface OwnProps
{
    type: ConnectionEndType
    x: number
    y: number
    end_angle: number
    opacity: number
    blur: number
    is_highlighted: boolean | undefined
}

export function ConnectionEnd (props: OwnProps)
{
    const { type, x, y, end_angle, opacity, blur } = props
    let extra_classes = props.is_highlighted ? " highlighted " : ""

    const style_opacity = opacity * (1 - (blur / 100))
    const style: h.JSX.CSSProperties = {
        fillOpacity: style_opacity,
        // filter: `url(#blur_filter_${blur})`,
    }


    let points: Position[]
    if (type === ConnectionEndType.positive)
    {
        points = get_connection_arrow_end(end_angle)
    }
    else if (type === ConnectionEndType.negative)
    {
        points = get_connection_bar_end(end_angle)
    }
    else
    {
        style.fillOpacity = 0
        style.strokeOpacity = style_opacity
        points = get_connection_noop_end(end_angle)
        extra_classes += " noop_end "
    }
    const path = points_to_path({ x, y }, points)


    return <polygon
        className={"connection_end " + extra_classes}
        points={path}
        style={style}
    />
}



function points_to_path (start: { x: number, y: number }, points: { x: number, y: number }[])
{
    const { x, y } = start
    let path = `${x}, ${-y} `

    points.forEach(point => path += `${x + point.x}, ${-y - point.y} `)

    return path
}



function get_connection_arrow_end (end_angle: number)
{
    const p1 = get_arrow_end_points(end_angle, 1)
    const p2 = get_arrow_end_points(end_angle, -1)

    return [p1, p2]
}


const arrow_angle = rads._25
function get_arrow_end_points (angle: number, type: 1 | -1)
{
    return to_vec(angle + (type * arrow_angle), 10)
}



const BAR_WIDTH = 12
const BAR_HALF_WIDTH = BAR_WIDTH / 2
const BAR_THICKNESS = 4
function get_connection_bar_end (end_angle: number)
{
    const p1 = to_vec(end_angle + rads._90, BAR_HALF_WIDTH)
    const p2 = add_vec(to_vec(end_angle, BAR_THICKNESS), p1)
    const p3 = add_vec(to_vec(end_angle - rads._90, BAR_WIDTH), p2)
    const p4 = add_vec(to_vec(end_angle - rads._180, BAR_THICKNESS), p3)

    return [ p1, p2, p3, p4 ]
}



const NOOP_SIZE = 9
function get_connection_noop_end (end_angle: number)
{
    const p1 = to_vec(end_angle + rads._315, NOOP_SIZE)
    const p2 = add_vec(to_vec(end_angle + rads._45, NOOP_SIZE), p1)
    const p3 = add_vec(to_vec(end_angle + rads._135, NOOP_SIZE), p2)
    const p4 = add_vec(to_vec(end_angle + rads._225, NOOP_SIZE), p3)

    return [ p1, p2, p3, p4 ]
}