import { get_supabase } from "../../../supabase/get_supabase"
import type { SupabaseKnowledgeBase } from "../../../supabase/interfaces"
import type { SpecialisedObjectsFromToServer } from "../../../wcomponent/interfaces/SpecialisedObjects"
import { local_data } from "../local/data"
import { supabase_get_knowledge_views, supabase_get_base_tree_knowledge_views, supabase_get_knowledge_views_from_other_bases } from "./knowledge_view"
import { supabase_get_wcomponents, supabase_get_wcomponents_from_other_bases } from "./wcomponent"



export async function supabase_load_data (load_state_from_storage: boolean, chosen_base: SupabaseKnowledgeBase)
{
    if (!load_state_from_storage)
    {
        return Promise.resolve<SpecialisedObjectsFromToServer>(local_data)
    }

    const supabase = get_supabase()

    const knowledge_views_response = await supabase_get_knowledge_views({ supabase, base_id: chosen_base.id })
    if (knowledge_views_response.error) return Promise.reject(knowledge_views_response.error)
    let knowledge_views = knowledge_views_response.items

    const base_tree_knowledge_views_response = await supabase_get_base_tree_knowledge_views({
        supabase,
        base: chosen_base,
        knowledge_views,
    })
    if (base_tree_knowledge_views_response.error) return Promise.reject(base_tree_knowledge_views_response.error)
    knowledge_views = knowledge_views.concat(base_tree_knowledge_views_response.items)


    const wcomponents_response = await supabase_get_wcomponents({ supabase, base_id: chosen_base.id })
    if (wcomponents_response.error) return Promise.reject(wcomponents_response.error)
    let wcomponents = wcomponents_response.items


    const wcomponents_other_bases_response = await supabase_get_wcomponents_from_other_bases({
        supabase,
        base_id: chosen_base.id,
        knowledge_views,
        wcomponents: wcomponents_response.items,
    })
    if (wcomponents_other_bases_response.error) return Promise.reject(wcomponents_other_bases_response.error)
    wcomponents = wcomponents.concat(wcomponents_other_bases_response.wcomponents)


    const knowledge_views_other_bases_response = await supabase_get_knowledge_views_from_other_bases({
        supabase,
        knowledge_views,
        wcomponents_from_other_bases: wcomponents_other_bases_response.wcomponents,
    })
    if (knowledge_views_other_bases_response.error) return Promise.reject(knowledge_views_other_bases_response.error)
    knowledge_views = knowledge_views.concat(knowledge_views_other_bases_response.items)


    return Promise.resolve<SpecialisedObjectsFromToServer>({
        knowledge_views,
        wcomponents,
    })
}
