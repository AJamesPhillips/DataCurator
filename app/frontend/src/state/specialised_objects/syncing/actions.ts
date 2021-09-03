import type { Action, AnyAction } from "redux"
import type { SpecialisedObjectsFromToServer } from "../../../shared/wcomponent/interfaces/SpecialisedObjects"



interface ActionReplaceAllSpecialisedObjects extends Action {
    specialised_objects: SpecialisedObjectsFromToServer
}

const replace_all_specialised_objects_type = "replace_all_specialised_objects"


interface ReplaceAllSpecialisedObjectsProps
{
    specialised_objects: SpecialisedObjectsFromToServer
}
const replace_all_specialised_objects = (args: ReplaceAllSpecialisedObjectsProps): ActionReplaceAllSpecialisedObjects =>
    ({ type: replace_all_specialised_objects_type, ...args })


export const is_replace_all_specialised_objects = (action: AnyAction): action is ActionReplaceAllSpecialisedObjects => {
    return action.type === replace_all_specialised_objects_type
}



interface ActionDeleteAllSpecialisedObjects extends Action {}

const clear_from_mem_all_specialised_objects_type = "clear_from_mem_all_specialised_objects"

const clear_from_mem_all_specialised_objects = (): ActionDeleteAllSpecialisedObjects =>
    ({ type: clear_from_mem_all_specialised_objects_type })

export const is_clear_from_mem_all_specialised_objects = (action: AnyAction): action is ActionDeleteAllSpecialisedObjects => {
    return action.type === clear_from_mem_all_specialised_objects_type
}


export const syncing_actions = {
    replace_all_specialised_objects,
    clear_from_mem_all_specialised_objects,
}
