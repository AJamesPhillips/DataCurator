import { h } from "preact"

import { rads } from "../../utils/angles"
import { to_vec } from "./utils"



interface OwnProps
{
    x: number
    y: number
    end_angle: number
    opacity: number
    blur: number
    is_highlighted: boolean | undefined
}

export function ConnectionEnd (props: OwnProps)
{
    const { x, y, end_angle, opacity, blur } = props
    const { arrowhead_p1, arrowhead_p2 } = get_connection_end({ end_angle })
    const extra_classes = props.is_highlighted ? " highlighted " : ""

    const style_arrowhead: h.JSX.CSSProperties = {
        fillOpacity: opacity * (1 - (blur / 100)),
        // filter: `url(#blur_filter_${blur})`,
    }

    return <polygon
        className={"connection_arrowhead " + extra_classes}
        points={`${x}, ${-y} ${x + arrowhead_p1.x}, ${-y - arrowhead_p1.y} ${x + arrowhead_p2.x}, ${-y - arrowhead_p2.y}`}
        style={style_arrowhead}
    />
}



interface GetConnectionEndArgs
{
    end_angle: number
}
function get_connection_end (args: GetConnectionEndArgs)
{
    const { end_angle } = args

    const arrowhead_p1 = get_arrow_end_points(end_angle, 1)
    const arrowhead_p2 = get_arrow_end_points(end_angle, -1)

    return {
        arrowhead_p1, arrowhead_p2,
    }
}



const arrow_angle = rads._25
function get_arrow_end_points (angle: number, type: 1 | -1)
{
    return to_vec(angle + (type * arrow_angle), 10)
}
