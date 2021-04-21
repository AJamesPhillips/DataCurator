import type { Action, AnyAction } from "redux"
import type { SpecialisedObjectsFromToServer } from "../../../shared/models/interfaces/SpecialisedObjects"



interface ActionReplaceAllSpecialisedObjects extends Action {
    specialised_objects: SpecialisedObjectsFromToServer
}

const replace_all_specialised_objects_type = "replace_all_specialised_objects"


interface ReplaceAllSpecialisedObjectsProps
{
    specialised_objects: SpecialisedObjectsFromToServer
}
const replace_all_specialised_objects = (args: ReplaceAllSpecialisedObjectsProps): ActionReplaceAllSpecialisedObjects =>
{
    return {
        type: replace_all_specialised_objects_type,
        specialised_objects: args.specialised_objects,
    }
}

export const is_replace_all_specialised_objects = (action: AnyAction): action is ActionReplaceAllSpecialisedObjects => {
    return action.type === replace_all_specialised_objects_type
}



export const syncing_actions = {
    replace_all_specialised_objects,
}
