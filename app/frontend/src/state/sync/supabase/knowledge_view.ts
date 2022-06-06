import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js"

import type { KnowledgeView } from "../../../shared/interfaces/knowledge_view"
import { parse_knowledge_view } from "../../../wcomponent/parse_json/parse_knowledge_view"
import type { KnowledgeViewTree, KnowledgeViewTreeEntry, SupabaseKnowledgeBase, SupabaseReadKnowledgeView, SupabaseWriteKnowledgeView } from "../../../supabase/interfaces"
import { supabase_create_item } from "./create_items"
import { supabase_get_items } from "./get_items"
import type { UpsertItemReturn } from "./interface"
import { app_item_to_supabase, supabase_item_to_app } from "./item_convertion"
import type { WComponent } from "../../../wcomponent/interfaces/SpecialisedObjects"



const TABLE_NAME = "knowledge_views"


type SupabaseGetKnowledgeViewsArgs =
{
    supabase: SupabaseClient
    ids?: string[]
} & ({
    base_id: number
    all_bases?: false
} | {
    base_id?: undefined
    all_bases: true
})
export function supabase_get_knowledge_views (args: SupabaseGetKnowledgeViewsArgs)
{
    return supabase_get_items<SupabaseReadKnowledgeView, KnowledgeView>({
        ...args,
        table: TABLE_NAME,
        converter: knowledge_view_supabase_to_app,
        specific_ids: args.ids,
    })
}



type SupabaseGetBaseTreeKnowledgeViewsArgs =
{
    supabase: SupabaseClient
    base: SupabaseKnowledgeBase
    knowledge_views: KnowledgeView[]
}
export function supabase_get_base_tree_knowledge_views (args: SupabaseGetBaseTreeKnowledgeViewsArgs)
{
    let specific_ids = get_kv_ids_from_tree(args.base.knowledge_view_tree || {})

    // Exclude if already downloaded
    const downloaded_knowledge_view_ids = new Set(args.knowledge_views.map(kv => kv.id))
    specific_ids = specific_ids.filter(id => !downloaded_knowledge_view_ids.has(id))

    return supabase_get_items<SupabaseReadKnowledgeView, KnowledgeView>({
        supabase: args.supabase,
        all_bases: true,
        table: TABLE_NAME,
        converter: knowledge_view_supabase_to_app,
        specific_ids,
    })
}


function get_kv_ids_from_tree (tree: KnowledgeViewTree): string[]
{
    const ids = Object.keys(tree)
    const entries = Object.values(tree)

    return ids.concat(...entries.map(entry => get_kv_ids_from_tree(entry.children || {})))
}



interface GetKnowledgeViewsFromOtherBases
{
    supabase: SupabaseClient
    knowledge_views: KnowledgeView[]
    wcomponents_from_other_bases: WComponent[]
}
export async function supabase_get_knowledge_views_from_other_bases (args: GetKnowledgeViewsFromOtherBases)
{
    let kv_ids_to_attempt_downloading = args.wcomponents_from_other_bases
        .filter(wc => !wc.deleted_at)
        .map(wc => wc.id)

    args.knowledge_views.forEach(kv =>
    {
        if (kv.parent_knowledge_view_id)
        {
            kv_ids_to_attempt_downloading.push(kv.parent_knowledge_view_id)
        }

        kv.foundation_knowledge_view_ids?.forEach(id => kv_ids_to_attempt_downloading.push(id))
    })

    // Exclude if already downloaded
    const downloaded_knowledge_view_ids = new Set(args.knowledge_views.map(kv => kv.id))
    kv_ids_to_attempt_downloading = kv_ids_to_attempt_downloading.filter(id => !downloaded_knowledge_view_ids.has(id))

    // Make unique
    kv_ids_to_attempt_downloading = Array.from(new Set(kv_ids_to_attempt_downloading))

    return await supabase_get_knowledge_views({
        supabase: args.supabase,
        ids: kv_ids_to_attempt_downloading,
        all_bases: true,
    })
}



interface SupabaseUpsertKnowledgeViewArgs
{
    supabase: SupabaseClient
    knowledge_view: KnowledgeView
}
type SupabaseUpsertKnowledgeViewReturn = Promise<UpsertItemReturn<KnowledgeView>>
export async function supabase_upsert_knowledge_view (args: SupabaseUpsertKnowledgeViewArgs): SupabaseUpsertKnowledgeViewReturn
{
    return args.knowledge_view.modified_at ? supabase_update_knowledge_view(args) : supabase_create_knowledge_view(args)
}



async function supabase_create_knowledge_view (args: SupabaseUpsertKnowledgeViewArgs): SupabaseUpsertKnowledgeViewReturn
{
    return supabase_create_item({
        supabase: args.supabase,
        table: TABLE_NAME,
        item: args.knowledge_view,
        converter_app_to_supabase: knowledge_view_app_to_supabase,
        converter_supabase_to_app: knowledge_view_supabase_to_app,
    })
}



async function supabase_update_knowledge_view (args: SupabaseUpsertKnowledgeViewArgs): SupabaseUpsertKnowledgeViewReturn
{
    const item = knowledge_view_app_to_supabase(args.knowledge_view)

    const result = await args.supabase.rpc("update_knowledge_view", { item })
    if (result.status === 401)
    {
        return { status: result.status, error: { message: "JWT expired" }, item: undefined }
    }


    let new_item: KnowledgeView | undefined = undefined
    let error: PostgrestError | Error | undefined = result.error || undefined
    try
    {
        let new_supabase_item: SupabaseReadKnowledgeView = result.data as any
        if (result.status === 409) new_supabase_item = JSON.parse(result.error!.details)
        new_item = knowledge_view_supabase_to_app(new_supabase_item)
    }
    catch (err)
    {
        console.error("Exception whilst handling rpc update_knowledge_view response", err)
        error = err as Error
    }


    return { status: result.status, error, item: new_item }
}



export function knowledge_view_app_to_supabase (item: KnowledgeView, base_id?: number): SupabaseWriteKnowledgeView
{
    return app_item_to_supabase(item, base_id)
}



export function knowledge_view_supabase_to_app (item: SupabaseReadKnowledgeView): KnowledgeView
{
    let kv = supabase_item_to_app(item)
    kv = parse_knowledge_view(kv)
    return kv
}
