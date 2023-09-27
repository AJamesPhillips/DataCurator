import type { ConnectionTerminalDirectionType } from "../../wcomponent/interfaces/SpecialisedObjects"
import { describe, test } from "../../shared/utils/test"
import { get_angle, rads, normalise_angle_between_neg_Pi_and_Pi } from "../../utils/angles"
import { bounded } from "../../shared/utils/bounded"
import type { ConnectionTerminalLocationType } from "../../wcomponent/interfaces/connection"



export function get_angle_from_start_connector (connection_angle: number, direction: ConnectionTerminalDirectionType)
{
    const angle_of_normal_to_connector_surface = angle_of_normal_to_connection_with_direction[direction]

    connection_angle += 0.0001 // Add 0.0001 to flip horizontal connections to go underneath

    return get_angle_from_connector({
        connection_angle,
        angle_of_normal_to_connector_surface,
        offset_direction: -1
    })
}

export function get_angle_from_end_connector (connection_angle: number, direction: ConnectionTerminalDirectionType)
{
    const angle_of_normal_to_connector_surface = angle_of_normal_to_connection_with_direction[direction]

    connection_angle += Math.PI // Add PI because we need the opposite angle for the control point

    return get_angle_from_connector({
        connection_angle,
        angle_of_normal_to_connector_surface,
        offset_direction: 1
    })
}


const angle_of_normal_to_connection_location: {[l in ConnectionTerminalLocationType]: number} =
{
    left: rads._180,
    top: rads._90,
    right: 0,
    bottom: -rads._90,
}
const angle_of_normal_to_connection_with_direction: {[l in ConnectionTerminalDirectionType]: number} =
{
    from: angle_of_normal_to_connection_location.right,
    to: angle_of_normal_to_connection_location.left,
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
    const offsetted_angle = peeled_angle // + (args.offset_direction * angle_offset)
    const bounded_angle = bounded(offsetted_angle, -max_connection_angle_from_normal, max_connection_angle_from_normal)
    const corrected_angle = bounded_angle + args.angle_of_normal_to_connector_surface
    return corrected_angle
}



export const test_get_angle = describe.skip("get_angle (a lot of the tests are broken and need to be updated to match current working functionality)", () =>
{
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
        "-0.79",
        "-0.87",
        "-0.87",
        "-0.87",
        "0.09",
        "0.09",
        "0.09",
        "0.00",
    ]

    coords.forEach(({ ex, ey }, index) =>
    {
        const angle = get_angle(cx, cy, ex, ey)
        const start_angle = get_angle_from_start_connector(angle, "from").toFixed(2)
        test(start_angle, expected_start_angles[index])
    })


    const expected_end_angles_to_receiving = [
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
        const end_angle_to_receiving_terminal = get_angle_from_end_connector(angle, "to").toFixed(2)
        test(end_angle_to_receiving_terminal, expected_end_angles_to_receiving[index])
    })

}, false)
