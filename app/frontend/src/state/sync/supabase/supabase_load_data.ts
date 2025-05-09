import { get_supabase } from "../../../supabase/get_supabase"
import type { SpecialisedObjectsFromToServer } from "../../../wcomponent/interfaces/SpecialisedObjects"
import { local_data } from "../local/data"
import { supabase_get_knowledge_views, supabase_get_knowledge_views_from_other_bases } from "./knowledge_view"
import { supabase_get_wcomponents, supabase_get_wcomponents_from_other_bases } from "./wcomponent"



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


    const wcomponents_other_bases_response = await supabase_get_wcomponents_from_other_bases({
        supabase, base_id,
        knowledge_views: knowledge_views_response.value,
        wcomponents: wcomponents_response.value,
    })
    if (wcomponents_other_bases_response.error) return Promise.reject(wcomponents_other_bases_response.error)


    const knowledge_views_other_bases_response = await supabase_get_knowledge_views_from_other_bases({
        supabase,
        knowledge_views: knowledge_views_response.value,
        wcomponents_from_other_bases: wcomponents_other_bases_response.wcomponents,
    })
    if (knowledge_views_other_bases_response.error) return Promise.reject(knowledge_views_other_bases_response.error)


    const wcomponents = [
        ...wcomponents_response.value,
        ...wcomponents_other_bases_response.wcomponents,
    ]


    const knowledge_views = [
        ...knowledge_views_response.value,
        ...knowledge_views_other_bases_response.value,
    ]


    return Promise.resolve<SpecialisedObjectsFromToServer>({
        knowledge_views,
        wcomponents,
    })
}
