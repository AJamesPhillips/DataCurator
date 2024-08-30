import { ConnectionLineBehaviour } from "../../wcomponent/interfaces/SpecialisedObjects"
import { ConnectionEndType } from "./ConnectionEnd"
import { derive_connection_coords, DeriveConnectionCoordsArgs, DeriveConnectionCoordsReturn } from "./derive_coords"
import { ConnectionTerminus } from "./terminal"



interface ProcessConnectionTerminusArgs {
    end_size: number
    connection_from_component: ConnectionTerminus | undefined
    connection_to_component: ConnectionTerminus | undefined
    line_behaviour: ConnectionLineBehaviour | undefined
    circular_links: boolean | undefined
    connection_end_type: ConnectionEndType
}
export function process_connection_terminus_args (args: ProcessConnectionTerminusArgs): null | DeriveConnectionCoordsReturn
{
    const {
        end_size, connection_from_component, connection_to_component,
        line_behaviour, circular_links, connection_end_type
    } = args

    const fudged_end_size = end_size / 10

    let derived_connection_coords_args: DeriveConnectionCoordsArgs
    if (!connection_from_component)
    {
        if (!connection_to_component) return null
        derived_connection_coords_args = {
            connection_from_component,
            connection_to_component,
            line_behaviour,
            circular_links,
            end_size: fudged_end_size,
            connection_end_type,
        }
    }
    else
    {
        derived_connection_coords_args = {
            connection_from_component,
            connection_to_component,
            line_behaviour,
            circular_links,
            end_size: fudged_end_size,
            connection_end_type,
        }
    }

    return derive_connection_coords(derived_connection_coords_args)
}
