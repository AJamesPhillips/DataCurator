import type { SpecialisedObjectsFromToServer } from "../../../wcomponent/interfaces/SpecialisedObjects"
import { get_supabase } from "../../../supabase/get_supabase"
import { supabase_get_knowledge_views } from "./knowledge_view"
import { supabase_get_wcomponents } from "./wcomponent"
import { local_data } from "../local/data"



export async function supabase_load_data (load_state_from_storage: boolean, base_id: number)
{
    if (!load_state_from_storage)
    {
        return Promise.resolve<SpecialisedObjectsFromToServer>(local_data)
    }

    const supabase = get_supabase()

    const knowledge_views_response = await supabase_get_knowledge_views({ supabase, base_id })
    if (knowledge_views_response.error) return Promise.reject(knowledge_views_response.error)


    const wcomponents_response = await supabase_get_wcomponents({ supabase, base_id })
    if (wcomponents_response.error) return Promise.reject(wcomponents_response.error)


    return Promise.resolve<SpecialisedObjectsFromToServer>({
        knowledge_views: knowledge_views_response.items,
        wcomponents: wcomponents_response.items,
    })
}
