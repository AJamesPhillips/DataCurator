import type { RootState } from "../../State"



export function needs_save (state: RootState)
{
    const { wcomponent_ids, knowledge_view_ids } = state.sync.specialised_object_ids_pending_save

    return (wcomponent_ids.size + knowledge_view_ids.size) > 0
}



interface GetNextSpecialisedStateIdToSaveReturn
{
    knowledge_view_id?: string
    wcomponent_id?: string
}
export function get_next_specialised_state_id_to_save (state: RootState): GetNextSpecialisedStateIdToSaveReturn
{
    const { wcomponent_ids, knowledge_view_ids } = state.sync.specialised_object_ids_pending_save

    const knowledge_view_ids_iterator = knowledge_view_ids.values()
    const knowledge_view_id = knowledge_view_ids_iterator.next()
    if (!knowledge_view_id.done)
    {
        const id = knowledge_view_id.value
        return { knowledge_view_id: id }
    }


    const wcomponent_ids_iterator = wcomponent_ids.values()
    const wcomponent_id = wcomponent_ids_iterator.next()
    if (!wcomponent_id.done)
    {
        const id = wcomponent_id.value
        return { wcomponent_id: id }
    }


    return {}
}
