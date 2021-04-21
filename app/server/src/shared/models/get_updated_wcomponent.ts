import type { WComponent } from "./SpecialisedObjects"



interface GetUpdatedWcomponentReturn
{
    wcomponent: WComponent
    different_type: boolean
}
export function get_updated_wcomponent (wcomponent: WComponent, partial: Partial<WComponent>): GetUpdatedWcomponentReturn
{
    const different_type = partial.type !== undefined && partial.type !== wcomponent.type

    // We are not deleting attributes of other WComponent types
    // we are leaving them as they can be used for a cheap "undo"
    // Later when this object is saved to the server into a database, we
    // can enforce the type shape then.  For now it does not seem necessary.
    wcomponent = {...wcomponent, ...partial} as any

    return {
        wcomponent,
        different_type,
    }
}
