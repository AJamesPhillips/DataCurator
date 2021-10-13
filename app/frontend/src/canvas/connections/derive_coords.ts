import type { KnowledgeViewWComponentEntry } from "../../shared/interfaces/knowledge_view"
import { bounded } from "../../shared/utils/bounded"
import type { ConnectionLineBehaviour, ConnectionTerminalType } from "../../wcomponent/interfaces/SpecialisedObjects"
import { get_angle, rads } from "../../utils/angles"
import { get_magnitude } from "../../utils/vector"
import { get_angle_from_start_connector, get_angle_from_end_connector } from "./angles"
import { get_connection_point } from "./terminal"
import { to_vec, Vector } from "./utils"



interface DeriveCoordsArgs
{
    from_node_position: KnowledgeViewWComponentEntry
    to_node_position: KnowledgeViewWComponentEntry
    from_connection_type: ConnectionTerminalType
    to_connection_type: ConnectionTerminalType
    line_behaviour?: ConnectionLineBehaviour
}
export function derive_coords (args: DeriveCoordsArgs )
{
    const { from_node_position, to_node_position, from_connection_type, to_connection_type, line_behaviour } = args

    const from_connector_position = get_connection_point(from_node_position, from_connection_type)
    const to_connector_position = get_connection_point(to_node_position, to_connection_type)

    const x1 = from_connector_position.left
    const y1 = -from_connector_position.top

    const x2 = to_connector_position.left
    const y2 = -to_connector_position.top

    let control_point1: Vector = { x: 0, y: 0 }
    let control_point2 = control_point1

    const angle = get_angle(x1, y1, x2, y2)
    let end_angle = angle + rads._180

    if (line_behaviour === undefined || line_behaviour === "curve")
    {
        const magnitude = get_magnitude(x1, y1, x2, y2) / 3

        const start_angle = get_angle_from_start_connector(angle, from_connection_type.direction)
        end_angle = get_angle_from_end_connector(angle, to_connection_type.direction)

        const control_point_magnitude = bounded(magnitude, 10, 300)
        control_point1 = to_vec(start_angle, control_point_magnitude)
        control_point2 = to_vec(end_angle, control_point_magnitude)
    }


    return {
        x1, y1, x2, y2, control_point1, control_point2, end_angle
    }
}
