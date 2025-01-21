import { get_angle, rads } from "../../utils/angles"
import { wcomponent_type_is_plain_connection, ConnectionLineBehaviour } from "../../wcomponent/interfaces/SpecialisedObjects"
import { CanvasPoint } from "../interfaces"
import { NODE_WIDTH } from "../position_utils"
import { ConnectionEndType, BAR_THICKNESS, NOOP_THICKNESS } from "./ConnectionEnd"
import { ConnectionTerminus, get_connection_point } from "./terminal"
import { Vector } from "./utils"


// This MIN_NODE_HORIZONTAL_GAP is the minimum horizontal distance between two
// nodes before theconnection line will move to the other side of the node.  So
// for example:
//  [from]
//           [ to ]
//        ^^^ if this distance is < MIN_NODE_HORIZONTAL_GAP then the line will
// move to the other side of the node e.g.:
//  [from]-----------╮
//           [ to ]<-╯
// but when there is more space then it will show as:
//  [from]--╮
//          ╰-->[ to ]
const MIN_NODE_HORIZONTAL_GAP = 45
const NODE_WIDTH_plus_min_gap = (connection_terminus: ConnectionTerminus) =>
{
    let node_width = 0
    if (wcomponent_type_is_plain_connection(connection_terminus.wcomponent_type))
    {
        // no-op.  Leave the node_width as 0 because this is a connection so it
        // is not a node, and doesn't have a "node width".
        node_width = 0
    }
    else
    {
        const { s: size = 1 } = connection_terminus.kv_wc_entry
        node_width = NODE_WIDTH * size
    }

    return node_width + MIN_NODE_HORIZONTAL_GAP
}
const OFFSET_Y_CONNECTION = 30
const MINIMUM_LINE_BOW = 30
const CONNECTION_LENGTH_WHEN_MISSING_ONE_NODE = 150



export interface ConnectionCoords
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

export interface DeriveConnectionCoordsArgs
{
    connection_from_component: ConnectionTerminus | undefined
    connection_to_component: ConnectionTerminus | undefined
    line_behaviour: ConnectionLineBehaviour | undefined
    circular_links: boolean
    end_size: number
    connection_end_type: ConnectionEndType
    console_warn?: (args: any[]) => void
}

export function derive_connection_coords (args: DeriveConnectionCoordsArgs): ConnectionCoords | null
{
    if (args.end_size === 0)
    {
        ;(args.console_warn || console.warn)(`Invalid connection end_size "${args.end_size}", defaulting to 1`)
        args.end_size = 1 // Maybe we should just default to something very small like 0.001, or allow 0?
    }

    const {
        connection_from_component, connection_to_component,
        line_behaviour, circular_links, end_size, connection_end_type,
    } = args

    if (!connection_from_component || !connection_to_component)
    {
        return derive_connection_coords_when_missing_one_node(args)
    }

    const { offset_line_start_y, offset_connection_start_y, invert_end_angle, circular_link_from_below_to } = relative_connection_positions({
        circular_links,
        connection_from_component,
        connection_to_component,
    })

    const from_connector_position = get_connection_point(connection_from_component)
    const line_start_x = from_connector_position.left
    const line_start_y = -from_connector_position.top + offset_line_start_y

    const to_connector_position = get_connection_point(connection_to_component)
    const connection_end_x = to_connector_position.left
    const connection_end_y = -to_connector_position.top + offset_connection_start_y


    let x_control1_factor = 1
    let x_control2_factor = 1
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
        const min_xc = Math.max(Math.abs(xc), MINIMUM_LINE_BOW) * (Math.sign(xc) || -1)
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
            y_control1 = y_diff || -MINIMUM_LINE_BOW
            y_control2 = -y_diff || -MINIMUM_LINE_BOW
        }

        end_angle = invert_end_angle ? 0 : rads._180

        relative_control_point1 = { x: x_control1, y: y_control1 }
        relative_control_point2 = { x: x_control2, y: y_control2 }
    }


    // Connect to start of arrow / block / diamond etc
    const { line_end_x, line_end_y } = calculate_line_end_coords({connection_end_type, end_size, end_angle, connection_end_x, connection_end_y})


    return {
        line_start_x, line_start_y,
        relative_control_point1, relative_control_point2,
        line_end_x, line_end_y,
        connection_end_x, connection_end_y,
        end_angle,
    }
}


interface RelativeConnectionPositionsArgs
{
    circular_links: boolean
    connection_from_component: ConnectionTerminus
    connection_to_component: ConnectionTerminus
}
function relative_connection_positions(args: RelativeConnectionPositionsArgs)
{
    const defaults = {
        offset_line_start_y: 0,
        offset_connection_start_y: 0,
        invert_end_angle: false,
        circular_link_from_below_to: undefined as boolean | undefined,
    }

    if (!args.circular_links) return defaults

    const {
        connection_from_component,
        connection_to_component,
    } = args


    const is_from_connection = wcomponent_type_is_plain_connection(connection_from_component.wcomponent_type)
    const is_to_connection = wcomponent_type_is_plain_connection(connection_to_component.wcomponent_type)
    let offset_y_connection = (is_from_connection || is_to_connection) ? 0 : OFFSET_Y_CONNECTION


    if (connection_from_component.kv_wc_entry.left < (connection_to_component.kv_wc_entry.left - NODE_WIDTH_plus_min_gap(connection_from_component))) {
        // There's no overlap
        //  [from]
        //          [ to ]
    }
    else if (connection_to_component.kv_wc_entry.left < (connection_from_component.kv_wc_entry.left - NODE_WIDTH_plus_min_gap(connection_to_component))) {
        // There's no overlap in the opposite direction
        //  [ to ]
        //          [from]
        defaults.offset_line_start_y = offset_y_connection
        defaults.offset_connection_start_y = offset_y_connection
        connection_to_component.connection_terminal_type = { ...connection_to_component.connection_terminal_type, side: "right" }
        connection_from_component.connection_terminal_type = { ...connection_from_component.connection_terminal_type, side: "left" }
        defaults.invert_end_angle = true
    }

    else {
        // There's some kind of overlap, either of these to options
        //  [from]          |     [ to ]
        //     [ to ]       |        [from]
        defaults.circular_link_from_below_to = connection_to_component.kv_wc_entry.top < connection_from_component.kv_wc_entry.top
        if (defaults.circular_link_from_below_to) {
            // `from` component vertical position is above `to` component
            // [from]
            // [ to ]
            connection_from_component.connection_terminal_type = { ...connection_from_component.connection_terminal_type, side: "left" }
            defaults.offset_line_start_y = offset_y_connection
        }

        else {
            // `from` component vertical position is equal to or below `to` component
            //  [ to ] [from]        |   [ to ]
            //                       |   [from]
            connection_to_component.connection_terminal_type = { ...connection_to_component.connection_terminal_type, side: "right" }
            defaults.offset_connection_start_y = offset_y_connection
            defaults.invert_end_angle = true
        }
    }

    return defaults
}


function derive_connection_coords_when_missing_one_node (args: DeriveConnectionCoordsArgs): ConnectionCoords | null
{
    const {
        connection_from_component, connection_to_component,
        line_behaviour, circular_links, end_size, connection_end_type,
    } = args


    let line_start_x = 0
    const relative_control_point1: Vector = { x: 0, y: 0 }
    const relative_control_point2 = relative_control_point1


    let connector_position: CanvasPoint
    if (!connection_from_component)
    {
        if (!connection_to_component) return null
        line_start_x = connection_to_component.kv_wc_entry.left - CONNECTION_LENGTH_WHEN_MISSING_ONE_NODE
        connector_position = get_connection_point(connection_to_component)
    }
    else
    {
        line_start_x = connection_from_component.kv_wc_entry.left + NODE_WIDTH
        connector_position = get_connection_point(connection_from_component)
    }

    const line_start_y = -connector_position.top

    const connection_end_x = line_start_x + CONNECTION_LENGTH_WHEN_MISSING_ONE_NODE
    const connection_end_y = line_start_y
    const end_angle = rads._180
    // Connect to start of arrow / block / diamond etc
    const { line_end_x, line_end_y } = calculate_line_end_coords({connection_end_type, end_size, end_angle, connection_end_x, connection_end_y})

    return {
        line_start_x, line_start_y,
        relative_control_point1, relative_control_point2,
        line_end_x, line_end_y,
        connection_end_x, connection_end_y,
        end_angle,
    }
}


interface CalculateLineEndCoordsArgs
{
    connection_end_type: ConnectionEndType
    end_size: number
    end_angle: number
    connection_end_x: number
    connection_end_y: number
}
function calculate_line_end_coords(args: CalculateLineEndCoordsArgs)
{
    const { connection_end_type, end_angle, connection_end_x, connection_end_y } = args
    // Some fudge which scales the end_size.  TODO: document this better.
    const end_size = args.end_size / 10

    const minimum_end_connector_shape_size = connection_end_type === ConnectionEndType.negative
        ? (BAR_THICKNESS * end_size)
        : connection_end_type === ConnectionEndType.noop ? NOOP_THICKNESS : (9 * end_size)
    const line_end_x = connection_end_x + Math.cos(end_angle) * minimum_end_connector_shape_size
    const line_end_y = connection_end_y + Math.sin(end_angle) * minimum_end_connector_shape_size

    return { line_end_x, line_end_y }
}


interface BezierMiddleArgs
{
    point1: Vector
    relative_control_point1: Vector
    relative_control_point2: Vector
    point2: Vector
}
export function bezier_middle (args: BezierMiddleArgs): Vector
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
