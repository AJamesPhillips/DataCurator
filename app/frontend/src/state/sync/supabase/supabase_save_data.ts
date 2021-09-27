import type { Base } from "../../../shared/interfaces/base"
import type { KnowledgeView } from "../../../shared/interfaces/knowledge_view"
import type {
    SpecialisedObjectsFromToServer,
    WComponent,
} from "../../../shared/wcomponent/interfaces/SpecialisedObjects"
import type { UserInfoState } from "../../user_info/state"
import type { SyncError } from "../utils/errors"



export async function save_supabase_data (user_info: UserInfoState, data: SpecialisedObjectsFromToServer)
{
    return Promise.resolve()
    // return save_knowledge_views(supabase_pod_URL, data.knowledge_views)
    // .then(() => save_wcomponents(supabase_pod_URL, data.wcomponents))
}



// async function save_knowledge_views (supabase_pod_URL: string, knowledge_views: KnowledgeView[])
// {

//     const result = await save_items(knowledge_views_url, knowledge_views, [])
//     return result.error && Promise.reject(result.error)
// }



// async function save_wcomponents (supabase_pod_URL: string, wcomponents: WComponent[])
// {
//     const result = await save_items(wcomponents_url, wcomponents, [])
//     return result.error && Promise.reject(result.error)
// }



async function save_items <I extends Base & { title: string }> (items_URL: string, items: I[], item_ids_to_remove: string[]) //, cached_items_dataset: SolidDataset | undefined)
{
    let error: SyncError | undefined = undefined


    return { error }
}
