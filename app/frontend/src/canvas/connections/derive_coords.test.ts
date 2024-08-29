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
        x1: 250, y1: -77,
        xe2: 350, ye2: -77,
        xo2: 350, yo2: -77,
        relative_control_point1: { x: 0, y: 0 },
        relative_control_point2: { x: 0, y: 0 },
        end_angle: 3.1,
    }, "straight line between two nodes")


    args = test_helper__get_args()
    args.from_node_data = undefined
    args.to_node_data!.position = { top: 0, left: 0 }
    result = derive_connection_coords(args)

    test(test_helper__round_derived_connection_coords(result), {
        x1: -150, y1: -77,
        xe2: 0, ye2: -77,
        xo2: 0, yo2: -77,
        relative_control_point1: { x: 0, y: 0 },
        relative_control_point2: { x: 0, y: 0 },
        end_angle: 3.1,
    }, "straight line to one node from nothing")


    args = test_helper__get_args()
    args.from_node_data!.position = { top: 0, left: 0 }
    args.to_node_data = undefined
    result = derive_connection_coords(args)

    test(test_helper__round_derived_connection_coords(result), {
        x1: 250, y1: -77,
        xe2: 400, ye2: -77,
        xo2: 400, yo2: -77,
        relative_control_point1: { x: 0, y: 0 },
        relative_control_point2: { x: 0, y: 0 },
        end_angle: 3.1,
    }, "straight line from one node to nothing")
})


function test_helper__get_args (): DeriveConnectionCoordsArgs
{
    return {
        from_node_data: {
            position: { top: 0, left: 0 },
            type: "statev2",
            connection_type: { direction: "from", attribute: "state" },
        },
        to_node_data: {
            position: { top: 0, left: NODE_WIDTH + 100 },
            type: "statev2",
            connection_type: { direction: "to", attribute: "state" },
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
        x1: round_to_max_significant_figures(coords.x1, 2),
        y1: round_to_max_significant_figures(coords.y1, 2),
        xe2: round_to_max_significant_figures(coords.xe2, 2),
        ye2: round_to_max_significant_figures(coords.ye2, 2),
        xo2: round_to_max_significant_figures(coords.xo2, 2),
        yo2: round_to_max_significant_figures(coords.yo2, 2),
        relative_control_point1: {
            x: round_to_max_significant_figures(coords.relative_control_point1.x, 2),
            y: round_to_max_significant_figures(coords.relative_control_point1.y, 2),
        },
        relative_control_point2: {
            x: round_to_max_significant_figures(coords.relative_control_point2.x, 2),
            y: round_to_max_significant_figures(coords.relative_control_point2.y, 2),
        },
        end_angle: round_to_max_significant_figures(coords.end_angle, 2),
    }
}
