import type { SpecialisedObjectsFromToServer } from "../../../shared/wcomponent/interfaces/SpecialisedObjects"



export function get_solid_data ()
{
    return Promise.resolve<SpecialisedObjectsFromToServer>({
        knowledge_views: [],
        wcomponents: [],
        perceptions: [],
    })
}



export function save_solid_data (data: SpecialisedObjectsFromToServer)
{
    return Promise.resolve()
}
