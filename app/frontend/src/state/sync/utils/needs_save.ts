import type { RootState } from "../../State"
import type { SPECIALISED_OBJECT_TYPE } from "../actions"



export function needs_save (state: RootState)
{
    const { wcomponent_ids, knowledge_view_ids } = state.sync.specialised_object_ids_pending_save

    return (wcomponent_ids.size + knowledge_view_ids.size) > 0
}



type GetNextSpecialisedStateIdToSaveReturn = undefined | { id: string; object_type: SPECIALISED_OBJECT_TYPE }
export function get_next_specialised_state_id_to_save (state: RootState): GetNextSpecialisedStateIdToSaveReturn
{
    const { wcomponent_ids, knowledge_view_ids } = state.sync.specialised_object_ids_pending_save

    // Save wcomponent first so that adding new components to a large knowledge view is faster
    // This is a "hack" to minimise chance of someone adding a new component, changing a field's value
    // and then having that value overwritten when the wcomponent is finally saved to the DB
    // ... a better solution would be to prioritise the changed value of the field over the values
    // returned from the DB.
    const wcomponent_ids_iterator = wcomponent_ids.values()
    const wcomponent_id = wcomponent_ids_iterator.next()
    if (!wcomponent_id.done)
    {
        const id = wcomponent_id.value
        return { id, object_type: "wcomponent" }
    }


    const knowledge_view_ids_iterator = knowledge_view_ids.values()
    const knowledge_view_id = knowledge_view_ids_iterator.next()
    if (!knowledge_view_id.done)
    {
        const id = knowledge_view_id.value
        return { id, object_type: "knowledge_view" }
    }

    return undefined
}
