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

    let relative_control_point1: Vector = { x: 0, y: 0 }
    let relative_control_point2 = relative_control_point1

    const angle = get_angle(x1, y1, x2, y2)
    let end_angle = angle + rads._180

    if (line_behaviour === undefined || line_behaviour === "curve")
    {
        if (x2 < x1 + 20)
        {
            ({ end_angle, relative_control_point1, relative_control_point2 } = loop_curve(x1, y1, x2, y2, angle, from_connection_type, end_angle, to_connection_type, relative_control_point1, relative_control_point2))
        }
        else
        {
            end_angle = rads._180
            const xc = (x2 - x1) / 2
            relative_control_point1 = { x: xc, y: 0 }
            relative_control_point2 = { x: -xc, y: 0 }
        }
    }


    return {
        x1, y1, x2, y2, relative_control_point1, relative_control_point2, end_angle
    }
}



function loop_curve (x1: number, y1: number, x2: number, y2: number, angle: number, from_connection_type: ConnectionTerminalType, end_angle: number, to_connection_type: ConnectionTerminalType, relative_control_point1: Vector, relative_control_point2: Vector)
{
    const magnitude = get_magnitude(x1, y1, x2, y2) / 3

    const start_angle = get_angle_from_start_connector(angle, from_connection_type.direction)
    end_angle = get_angle_from_end_connector(angle, to_connection_type.direction)

    const control_point_magnitude = bounded(magnitude, 10, 300)
    relative_control_point1 = to_vec(start_angle, control_point_magnitude)
    relative_control_point2 = to_vec(end_angle, control_point_magnitude)
    return { end_angle, relative_control_point1, relative_control_point2 }
}



interface BezierMiddleArgs
{
    point1: Vector
    point2: Vector
    relative_control_point1: Vector
    relative_control_point2: Vector
}
export function bezier_middle (args: BezierMiddleArgs)
{
    const C1 = add_point(args.point1, args.relative_control_point1)
    const C2 = add_point(args.point2, args.relative_control_point2)

    const E = average_point(args.point1, C1)
    const F = average_point(C1, C2)
    const G = average_point(C2, args.point2)

    const H = average_point(E, F)
    const I = average_point(F, G)

    return average_point(H, I)
}



function add_point (point1: Vector, point2: Vector): Vector
{
    return {
        x: point1.x + point2.x,
        y: point1.y + point2.y,
    }
}



function average_point (point1: Vector, point2: Vector): Vector
{
    return {
        x: (point1.x + point2.x) / 2,
        y: (point1.y + point2.y) / 2,
    }
}
