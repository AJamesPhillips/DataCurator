import type { SpecialisedObjectsFromToServer } from "../../../shared/wcomponent/interfaces/SpecialisedObjects"
import { get_supabase } from "../../../supabase/get_supabase"
import type { RootState } from "../../State"
import { get_knowledge_views } from "./knowledge_view"
import { get_wcomponents } from "./wcomponent"



export async function supabase_load_data (state: RootState)
{
    const supabase = get_supabase()
    const { chosen_base_id: base_id } = state.user_info

    if (base_id === undefined) return Promise.reject("chosen_base_id is undefined")


    const knowledge_views_response = await get_knowledge_views({ supabase, base_id })
    if (knowledge_views_response.error) return Promise.reject(knowledge_views_response.error)


    const wcomponents_response = await get_wcomponents({ supabase, base_id })
    if (wcomponents_response.error) return Promise.reject(wcomponents_response.error)


    return Promise.resolve<SpecialisedObjectsFromToServer>({
        knowledge_views: knowledge_views_response.items,
        wcomponents: wcomponents_response.items,
        perceptions: [],
    })
}
