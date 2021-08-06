import type { SpecialisedObjectsFromToServer } from "../../shared/wcomponent/interfaces/SpecialisedObjects"
import { parse_specialised_objects_fromto_server } from "../../shared/wcomponent/parse_json/parse_specialised_objects"



export function parse_specialised_objects_from_server_data (data: SpecialisedObjectsFromToServer | null)
{
    try
    {
        return parse_specialised_objects_fromto_server(data)
    }
    catch (e)
    {
        console.error(`Error parsing specialised objects state from server`)
        throw e
    }
}
