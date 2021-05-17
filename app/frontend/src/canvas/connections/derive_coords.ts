import type { ConnectionLocationType } from "../../shared/models/interfaces/SpecialisedObjects"
import { get_angle, rads } from "../../utils/angles"
import { bounded } from "../../utils/utils"
import { get_magnitude } from "../../utils/vector"
import { _get_connection_point } from "../ConnectableCanvasNode"
import type { CanvasPoint } from "../interfaces"
import { get_angle_from_start_connector, get_angle_from_end_connector } from "./angles"
import { to_vec } from "./utils"



interface DeriveCoordsArgs
{
    from_node_position: CanvasPoint
    to_node_position: CanvasPoint
    from_connection_location: ConnectionLocationType
    to_connection_location: ConnectionLocationType
}
export function derive_coords (args: DeriveCoordsArgs )
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



const arrow_angle = rads._25
function get_arrow_end_points (angle: number, type: 1 | -1)
{
    return to_vec(angle + (type * arrow_angle), 10)
}
