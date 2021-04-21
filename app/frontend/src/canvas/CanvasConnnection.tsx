import { h } from "preact"

import type { ConnectionLocationType } from "../shared/models/interfaces/SpecialisedObjects"
import { test } from "../shared/utils/test"
import { get_angle, normalise_angle_between_neg_Pi_and_Pi, rads } from "../utils/angles"
import { bounded } from "../utils/utils"
import { get_magnitude } from "../utils/vector"
import { _get_connection_point } from "./ConnectableCanvasNode"
import type { CanvasPoint } from "./interfaces"



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

    const { x1, y1, x2, y2, control_point1, control_point2, arrowhead_p1, arrowhead_p2 } = derive_coords({
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
    const style_arrowhead: h.JSX.CSSProperties = {
        fillOpacity: opacity * (1 - (blur / 100)),
        // filter: `url(#blur_filter_${blur})`,
    }

    const extra_classes = (props.on_click ? " mouseable " : "") + (props.is_highlighted ? " highlighted " : "")

    return <g className="connection" onClick={props.on_click} style={{ display: props.hidden ? "none" : "" }}>
        <path
            className={"connection_line " + extra_classes}
            d={`M ${x1} ${-y1} C ${x1 + control_point1.x} ${-y1 - control_point1.y}, ${x2 + control_point2.x} ${-y2 - control_point2.y}, ${x2} ${-y2}`}
            style={style_line}
        />

        <polygon
            className={"connection_arrowhead " + extra_classes}
            points={`${x2}, ${-y2} ${x2 + arrowhead_p1.x}, ${-y2 - arrowhead_p1.y} ${x2 + arrowhead_p2.x}, ${-y2 - arrowhead_p2.y}`}
            style={style_arrowhead}
        />
    </g>
}



interface DeriveCoordsArgs
{
    from_node_position: CanvasPoint
    to_node_position: CanvasPoint
    from_connection_location: ConnectionLocationType
    to_connection_location: ConnectionLocationType
}
function derive_coords (args: DeriveCoordsArgs )
{
    const { from_node_position, to_node_position, from_connection_location, to_connection_location } = args

    const from_connector_position = _get_connection_point(from_node_position, from_connection_location)
    const to_connector_position = _get_connection_point(to_node_position, to_connection_location)

    const x1 = from_connector_position.left
    const y1 = -from_connector_position.top

    const x2 = to_connector_position.left
    const y2 = -to_connector_position.top

    const angle = get_angle(x1, y1, x2, y2)
    const magnitude = get_magnitude(x1, y1, x2, y2) / 3

    const start_angle = get_angle_from_start_connector(angle, from_connection_location)
    const end_angle = get_angle_from_end_connector(angle, to_connection_location)

    const control_point_magnitude = bounded(magnitude, 10, 300)
    const control_point1 = to_vec(start_angle, control_point_magnitude)
    const control_point2 = to_vec(end_angle, control_point_magnitude)

    const arrowhead_p1 = get_arrow_end_points(end_angle, 1)
    const arrowhead_p2 = get_arrow_end_points(end_angle, -1)

    return {
        x1, y1, x2, y2, control_point1, control_point2, arrowhead_p1, arrowhead_p2,
    }
}


const angle_of_normal_to_connection_location: {[l in ConnectionLocationType]: number} =
{
    left: rads._180,
    top: rads._90,
    right: 0,
    bottom: -rads._90,
}

function get_angle_from_start_connector (connection_angle: number, connection_location: ConnectionLocationType)
{
    const angle_of_normal_to_connector_surface = angle_of_normal_to_connection_location[connection_location]

    return get_angle_from_connector({
        connection_angle: connection_angle,
        angle_of_normal_to_connector_surface,
        offset_direction: -1
    })
}

function get_angle_from_end_connector (connection_angle: number, connection_location: ConnectionLocationType)
{
    const angle_of_normal_to_connector_surface = angle_of_normal_to_connection_location[connection_location]

    return get_angle_from_connector({
        connection_angle: connection_angle + Math.PI, // Add PI because we need the opposite angle for the control point
        angle_of_normal_to_connector_surface,
        offset_direction: 1
    })
}


const angle_offset = rads._45
const max_connection_angle_from_normal = rads._50
interface GetAngleFromConnectorArgs
{
    connection_angle: number
    angle_of_normal_to_connector_surface: number
    offset_direction: 1 | -1
}
function get_angle_from_connector (args: GetAngleFromConnectorArgs)
{
    const angle = normalise_angle_between_neg_Pi_and_Pi(args.connection_angle - args.angle_of_normal_to_connector_surface)
    const peeled_angle = bounded(angle, -max_connection_angle_from_normal, max_connection_angle_from_normal)
    const offsetted_angle = peeled_angle + (args.offset_direction * angle_offset)
    const bounded_angle = bounded(offsetted_angle, -max_connection_angle_from_normal, max_connection_angle_from_normal)
    const corrected_angle = bounded_angle + args.angle_of_normal_to_connector_surface
    return corrected_angle
}



const arrow_angle = rads._25
function get_arrow_end_points (angle: number, type: 1 | -1)
{
    return to_vec(angle + (type * arrow_angle), 10)
}



function to_vec (angle: number, r: number)
{
    const x = r * Math.cos(angle)
    const y = r * Math.sin(angle)
    return { x, y }
}



function run_tests ()
{
    console.log("running tests of get_angle etc")

    const cx = 0
    const cy = 0

    const coords = [
        { ex:  10, ey:   0 },
        { ex:  10, ey: -10 },
        { ex:   0, ey: -10 },
        { ex: -10, ey: -10 },
        { ex: -10, ey:   0 },
        { ex: -10, ey:  10 },
        { ex:   0, ey:  10 },
        { ex:  10, ey:  10 },
    ]

    const expected_angles = [
         "0.00",
        "-0.79",
        "-1.57",
        "-2.36",
         "3.14",
         "2.36",
         "1.57",
         "0.79",
    ]

    coords.forEach(({ ex, ey }, index) =>
    {
        const angle = get_angle(cx, cy, ex, ey).toFixed(2)
        test(angle, expected_angles[index])
    })


    const expected_start_angles = [
        "0.70",
        "0.70",
        "0.70",
        "2.36",
        "2.36",
        "1.57",
        "0.79",
        "0.70",
    ]

    coords.forEach(({ ex, ey }, index) =>
    {
        const angle = get_angle(cx, cy, ex, ey)
        const start_angle = get_angle_from_start_connector(angle, "top").toFixed(2)
        test(start_angle, expected_start_angles[index])
    })


    const expected_end_angles_to_bottom = [
        "-2.36",
        "-2.44",
        "-0.70",
        "-0.70",
        "-0.70",
        "-0.70",
        "-0.79",
        "-1.57",
    ]
    const expected_end_angles_to_meta = [
        "-3.14",
        "2.44",
        "2.44",
        "2.44",
        "-2.44",
        "-2.44",
        "-2.44",
        "-2.44",
    ]

    coords.forEach(({ ex, ey }, index) =>
    {
        const angle = get_angle(cx, cy, ex, ey)
        const end_angle_to_bottom = get_angle_from_end_connector(angle, "bottom").toFixed(2)
        const end_angle_to_meta = get_angle_from_end_connector(angle, "left").toFixed(2)
        test(end_angle_to_bottom, expected_end_angles_to_bottom[index])
        test(end_angle_to_meta, expected_end_angles_to_meta[index])
    })
}

// run_tests()
