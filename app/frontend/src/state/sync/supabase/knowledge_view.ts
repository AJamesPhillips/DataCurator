import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js"

import type { KnowledgeView } from "../../../shared/interfaces/knowledge_view"
import type { SupabaseReadKnowledgeView, SupabaseWriteKnowledgeView } from "../../../supabase/interfaces"
import { clean_base_object_of_sync_meta_fields } from "./clean_base_object_for_supabase"
import { supabase_create_item } from "./create_items"
import { supabase_get_items } from "./get_items"
import { app_item_to_supabase, supabase_item_to_app } from "./item_convertion"



const TABLE_NAME = "knowledge_views"


type SupabaseGetKnowledgeViewsArgs =
{
    supabase: SupabaseClient
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
    })
}



interface SupabaseUpsertKnowledgeViewArgs
{
    supabase: SupabaseClient
    knowledge_view: KnowledgeView
}
export async function supabase_upsert_knowledge_view (args: SupabaseUpsertKnowledgeViewArgs)
{
    return args.knowledge_view.modified_at ? supabase_update_knowledge_view(args) : supabase_create_knowledge_view(args)
}



interface SupabaseCreateWcomponentArgs
{
    supabase: SupabaseClient
    knowledge_view: KnowledgeView
}
async function supabase_create_knowledge_view (args: SupabaseCreateWcomponentArgs)
{
    return supabase_create_item({
        supabase: args.supabase,
        table: TABLE_NAME,
        item: args.knowledge_view,
        converter_app_to_supabase: knowledge_view_app_to_supabase,
        converter_supabase_to_app: knowledge_view_supabase_to_app,
    })
}



interface SupabaseCreateWcomponentArgs
{
    supabase: SupabaseClient
    knowledge_view: KnowledgeView
}
async function supabase_update_knowledge_view (args: SupabaseCreateWcomponentArgs)
{
    const item = knowledge_view_app_to_supabase(args.knowledge_view)

    const result = await args.supabase.rpc("update_knowledge_view", { item })


    let new_item: KnowledgeView | undefined = undefined
    let error: PostgrestError | undefined | unknown = result.error || undefined
    try
    {
        let new_supabase_item: SupabaseReadKnowledgeView = result.data as any
        if (result.status === 409) new_supabase_item = JSON.parse(result.error!.details)
        new_item = knowledge_view_supabase_to_app(new_supabase_item)
    }
    catch (err)
    {
        console.error("Exception whilst handling rpc update_knowledge_view response", err)
        error = err
    }


    return { status: result.status, error, item: new_item }
}



export function knowledge_view_app_to_supabase (item: KnowledgeView, base_id?: number): SupabaseWriteKnowledgeView
{
    return app_item_to_supabase(item, base_id)
}



export function knowledge_view_supabase_to_app (item: SupabaseReadKnowledgeView): KnowledgeView
{
    return supabase_item_to_app(item)
}
