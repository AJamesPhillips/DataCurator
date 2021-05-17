import type { ConnectionLocationType } from "../../shared/models/interfaces/SpecialisedObjects"
import { test } from "../../shared/utils/test"
import { get_angle, rads, normalise_angle_between_neg_Pi_and_Pi } from "../../utils/angles"
import { bounded } from "../../utils/utils"
import { get_magnitude } from "../../utils/vector"
import { _get_connection_point } from "../ConnectableCanvasNode"
import type { CanvasPoint } from "../interfaces"



export function get_angle_from_start_connector (connection_angle: number, connection_location: ConnectionLocationType)
{
    const angle_of_normal_to_connector_surface = angle_of_normal_to_connection_location[connection_location]

    return get_angle_from_connector({
        connection_angle: connection_angle,
        angle_of_normal_to_connector_surface,
        offset_direction: -1
    })
}

export function get_angle_from_end_connector (connection_angle: number, connection_location: ConnectionLocationType)
{
    const angle_of_normal_to_connector_surface = angle_of_normal_to_connection_location[connection_location]

    return get_angle_from_connector({
        connection_angle: connection_angle + Math.PI, // Add PI because we need the opposite angle for the control point
        angle_of_normal_to_connector_surface,
        offset_direction: 1
    })
}

const angle_of_normal_to_connection_location: {[l in ConnectionLocationType]: number} =
{
    left: rads._180,
    top: rads._90,
    right: 0,
    bottom: -rads._90,
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



function run_tests ()
{
    console. log("running tests of get_angle etc")

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
        "1.66",
        "1.66",
        "1.66",
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
        "-1.66",
        "-1.66",
        "-0.70",
        "-0.70",
        "-0.70",
        "-0.70",
        "-0.79",
        "-1.57",
    ]
    const expected_end_angles_to_meta = [
        // TODO none of these angles should be > Pi or < -Pi
        "3.93",
        "3.14",
        "3.05",
        "3.05",
        "4.01",
        "4.01",
        "4.01",
        "4.01",
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