import { round_to_max_significant_figures } from "../../shared/utils/number"
import { describe, test } from "../../shared/utils/test"
import { NODE_WIDTH } from "../position_utils"
import { ConnectionEndType } from "./ConnectionEnd"
import { derive_connection_coords, DeriveConnectionCoordsArgs, DeriveConnectionCoordsReturn } from "./derive_coords"


export const test_derive_connection_coords = describe("derive_connection_coords", () =>
{
    let args = test_helper__get_args()
    args.from_node_data!.position = { top: 0, left: 0 }
    args.to_node_data!.position =   { top: 0, left: NODE_WIDTH + 100 }

    let result = derive_connection_coords(args)
    test(test_helper__round_derived_connection_coords(result), {
        line_start_x: 250, line_start_y: -77,
        relative_control_point1: { x: 0, y: 0 },
        relative_control_point2: { x: 0, y: 0 },
        line_end_x: 350, line_end_y: -77,
        connection_end_x: 350, connection_end_y: -77,
        end_angle: 3.1,
    }, "straight line between two nodes")


    args = test_helper__get_args()
    args.from_node_data = undefined
    args.to_node_data!.position = { top: 0, left: 0 }
    result = derive_connection_coords(args)

    test(test_helper__round_derived_connection_coords(result), {
        line_start_x: -150, line_start_y: -77,
        relative_control_point1: { x: 0, y: 0 },
        relative_control_point2: { x: 0, y: 0 },
        line_end_x: 0, line_end_y: -77,
        connection_end_x: 0, connection_end_y: -77,
        end_angle: 3.1,
    }, "straight line to one node from nothing")


    args = test_helper__get_args()
    args.from_node_data!.position = { top: 0, left: 0 }
    args.to_node_data = undefined
    result = derive_connection_coords(args)

    test(test_helper__round_derived_connection_coords(result), {
        line_start_x: 250, line_start_y: -77,
        relative_control_point1: { x: 0, y: 0 },
        relative_control_point2: { x: 0, y: 0 },
        line_end_x: 400, line_end_y: -77,
        connection_end_x: 400, connection_end_y: -77,
        end_angle: 3.1,
    }, "straight line from one node to nothing")
})


function test_helper__get_args (): DeriveConnectionCoordsArgs
{
    return {
        from_node_data: {
            position: { top: 0, left: 0 },
            wcomponent_type: "statev2",
            connection_terminal_type: { direction: "from", attribute: "state" },
        },
        to_node_data: {
            position: { top: 0, left: NODE_WIDTH + 100 },
            wcomponent_type: "statev2",
            connection_terminal_type: { direction: "to", attribute: "state" },
        },
        line_behaviour: "straight",
        circular_links: false,
        end_size: 0,
        connection_end_type: ConnectionEndType.positive,
    }
}


function test_helper__round_derived_connection_coords (coords: DeriveConnectionCoordsReturn): DeriveConnectionCoordsReturn
{
    return {
        line_start_x: round_to_max_significant_figures(coords.line_start_x, 2),
        line_start_y: round_to_max_significant_figures(coords.line_start_y, 2),
        relative_control_point1: {
            x: round_to_max_significant_figures(coords.relative_control_point1.x, 2),
            y: round_to_max_significant_figures(coords.relative_control_point1.y, 2),
        },
        relative_control_point2: {
            x: round_to_max_significant_figures(coords.relative_control_point2.x, 2),
            y: round_to_max_significant_figures(coords.relative_control_point2.y, 2),
        },
        line_end_x: round_to_max_significant_figures(coords.line_end_x, 2),
        line_end_y: round_to_max_significant_figures(coords.line_end_y, 2),
        connection_end_x: round_to_max_significant_figures(coords.connection_end_x, 2),
        connection_end_y: round_to_max_significant_figures(coords.connection_end_y, 2),
        end_angle: round_to_max_significant_figures(coords.end_angle, 2),
    }
}
