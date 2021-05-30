import type { ConnectionTerminalType } from "../../shared/wcomponent/interfaces/SpecialisedObjects"
import { get_angle } from "../../utils/angles"
import { bounded } from "../../shared/utils/bounded"
import { get_magnitude } from "../../utils/vector"
import type { CanvasPoint } from "../interfaces"
import { get_angle_from_start_connector, get_angle_from_end_connector } from "./angles"
import { get_connection_point } from "./terminal"
import { to_vec } from "./utils"



interface DeriveCoordsArgs
{
    from_node_position: CanvasPoint
    to_node_position: CanvasPoint
    from_connection_type: ConnectionTerminalType
    to_connection_type: ConnectionTerminalType
}
export function derive_coords (args: DeriveCoordsArgs )
{
    const { from_node_position, to_node_position, from_connection_type, to_connection_type } = args

    const from_connector_position = get_connection_point(from_node_position, from_connection_type)
    const to_connector_position = get_connection_point(to_node_position, to_connection_type)

    const x1 = from_connector_position.left
    const y1 = -from_connector_position.top

    const x2 = to_connector_position.left
    const y2 = -to_connector_position.top

    const angle = get_angle(x1, y1, x2, y2)
    const magnitude = get_magnitude(x1, y1, x2, y2) / 3

    const start_angle = get_angle_from_start_connector(angle, from_connection_type.direction)
    const end_angle = get_angle_from_end_connector(angle, to_connection_type.direction)

    const control_point_magnitude = bounded(magnitude, 10, 300)
    const control_point1 = to_vec(start_angle, control_point_magnitude)
    const control_point2 = to_vec(end_angle, control_point_magnitude)

    return {
        x1, y1, x2, y2, control_point1, control_point2, end_angle
    }
}
