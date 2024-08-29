import type { KnowledgeViewWComponentEntry } from "../../shared/interfaces/knowledge_view"
import type { ConnectionLineBehaviour, ConnectionTerminalDirectionType, ConnectionTerminalType, WComponent } from "../../wcomponent/interfaces/SpecialisedObjects"
import { get_angle, rads } from "../../utils/angles"
import { get_connection_point } from "./terminal"
import type { Vector } from "./utils"
import { NODE_WIDTH } from "../position_utils"
import { BAR_THICKNESS, ConnectionEndType, NOOP_THICKNESS } from "./ConnectionEnd"
import { WComponentType } from "../../wcomponent/interfaces/wcomponent_base"
import { deep_clone } from "../../utils/object"



const NODE_WIDTH_plus_fudge = NODE_WIDTH + 45
const minimum_line_bow = 30
const CONNECTION_LENGTH_WHEN_MISSING_ONE_NODE = 150


export interface WComponentConnectionData
{
    position: KnowledgeViewWComponentEntry
    type: WComponentType
    connection_type: ConnectionTerminalType
}

export type DeriveConnectionCoordsArgs = (
    (
        {
            from_node_data: WComponentConnectionData
            to_node_data: WComponentConnectionData | undefined
        } | {
            from_node_data: WComponentConnectionData | undefined
            to_node_data: WComponentConnectionData
        }
    ) & {
        line_behaviour?: ConnectionLineBehaviour
        circular_links?: boolean
        end_size: number
        connection_end_type: ConnectionEndType
    }
)

export interface DeriveConnectionCoordsReturn
{
    line_start_x: number
    line_start_y: number
    relative_control_point1: Vector
    relative_control_point2: Vector
    line_end_x: number
    line_end_y: number
    connection_end_x: number
    connection_end_y: number
    end_angle: number
}

export function derive_connection_coords (args: DeriveConnectionCoordsArgs): DeriveConnectionCoordsReturn
{
    let {
        from_node_data, to_node_data,
        line_behaviour, circular_links, end_size, connection_end_type,
    } = args

    if (!to_node_data)
    {
        from_node_data = from_node_data!
        to_node_data = deep_clone(from_node_data)!
        to_node_data.connection_type.direction = opposite_direction(from_node_data.connection_type.direction)
        to_node_data.position.left += (NODE_WIDTH + CONNECTION_LENGTH_WHEN_MISSING_ONE_NODE)
    }
    else if (!from_node_data)
    {
        // to_node_data = to_node_data!
        from_node_data = deep_clone(to_node_data)!
        from_node_data.connection_type.direction = opposite_direction(to_node_data.connection_type.direction)
        from_node_data.position.left -= (NODE_WIDTH + CONNECTION_LENGTH_WHEN_MISSING_ONE_NODE)
    }
    else
    {
        from_node_data = from_node_data
        to_node_data = to_node_data
    }

    let offset_line_start_y = 0
    let offset_connection_start_y = 0
    let x_control1_factor = 1
    let x_control2_factor = 1

    let circular_link_from_below_to: boolean | undefined = undefined
    let invert_end_angle = false
    if (circular_links)
    {
        if (from_node_data.position.left < (to_node_data.position.left - NODE_WIDTH_plus_fudge))
        {

        }
        else if (to_node_data.position.left < (from_node_data.position.left - NODE_WIDTH_plus_fudge))
        {
            offset_line_start_y = 30
            offset_connection_start_y = 30
            to_node_data.connection_type = { ...to_node_data.connection_type, direction: "from" }
            from_node_data.connection_type = { ...from_node_data.connection_type, direction: "to" }
            invert_end_angle = true
        }
        else
        {
            circular_link_from_below_to = to_node_data.position.top < from_node_data.position.top
            if (circular_link_from_below_to)
            {
                from_node_data.connection_type = { ...from_node_data.connection_type, direction: "to" }
                offset_line_start_y = 30
            }
            else
            {
                to_node_data.connection_type = { ...to_node_data.connection_type, direction: "from" }
                offset_connection_start_y = 30
                invert_end_angle = true
            }
        }
    }

    const from_connector_position = get_connection_point(from_node_data.position, from_node_data.connection_type)
    const to_connector_position = get_connection_point(to_node_data.position, to_node_data.connection_type)

    const line_start_x = from_connector_position.left
    const line_start_y = -from_connector_position.top + offset_line_start_y

    const connection_end_x = to_connector_position.left
    const connection_end_y = -to_connector_position.top + offset_connection_start_y


    if (circular_link_from_below_to !== undefined)
    {
        if (line_start_x < connection_end_x)
        {
            if (circular_link_from_below_to) x_control1_factor = -1
            else x_control2_factor = -1
        }
        else
        {
            if (circular_link_from_below_to) x_control2_factor = -1
            else x_control1_factor = -1
        }
    }


    let relative_control_point1: Vector = { x: 0, y: 0 }
    let relative_control_point2 = relative_control_point1

    const angle = get_angle(line_start_x, line_start_y, connection_end_x, connection_end_y)
    let end_angle = angle + rads._180

    if (line_behaviour === undefined || line_behaviour === "curve")
    {
        const xc = (connection_end_x - line_start_x) / 2
        const min_xc = Math.max(Math.abs(xc), minimum_line_bow) * (Math.sign(xc) || -1)
        let x_control1 = min_xc * x_control1_factor
        let x_control2 = -min_xc * x_control2_factor
        let y_control1 = 0
        let y_control2 = 0

        const going_right_to_left = connection_end_x <= line_start_x
        if (!circular_links && going_right_to_left)
        {
            const y_diff = connection_end_y - line_start_y

            x_control1 = Math.min(-x_control1, 300)
            x_control2 = Math.max(-x_control2, -300)
            y_control1 = y_diff || -minimum_line_bow
            y_control2 = -y_diff || -minimum_line_bow
        }

        end_angle = invert_end_angle ? 0 : rads._180

        relative_control_point1 = { x: x_control1, y: y_control1 }
        relative_control_point2 = { x: x_control2, y: y_control2 }
    }


    // Connect to start of arrow / block / diamond etc
    const minimum_end_connector_shape_size = connection_end_type === ConnectionEndType.negative
        ? (BAR_THICKNESS * end_size)
        : connection_end_type === ConnectionEndType.noop ? NOOP_THICKNESS : (9 * end_size)
    const line_end_x = connection_end_x + Math.cos(end_angle) * minimum_end_connector_shape_size
    const line_end_y = connection_end_y + Math.sin(end_angle) * minimum_end_connector_shape_size


    return {
        line_start_x, line_start_y,
        relative_control_point1, relative_control_point2,
        line_end_x, line_end_y,
        connection_end_x, connection_end_y,
        end_angle,
    }
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


function opposite_direction (direction: ConnectionTerminalDirectionType): ConnectionTerminalDirectionType
{
    if (direction === "from") return "to"
    return "from"
}
