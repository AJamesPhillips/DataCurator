import type { SupabaseClient } from "@supabase/supabase-js"

import type { KnowledgeView } from "../../../shared/interfaces/knowledge_view"
import type { SupabaseKnowledgeView } from "../../../supabase/interfaces"
import { clean_base_object_of_sync_meta_fields } from "./clean_base_object_for_supabase"
import { supabase_create_item } from "./create_items"
import { supabase_get_items } from "./get_items"



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
    return supabase_get_items<SupabaseKnowledgeView, KnowledgeView>({
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
    const new_supabase_item: SupabaseKnowledgeView = result.data as any
    const new_item = knowledge_view_supabase_to_app(new_supabase_item)

    return { status: result.status, error: result.error || undefined, item: new_item }
}



export function knowledge_view_app_to_supabase (item: KnowledgeView, base_id?: number): SupabaseKnowledgeView
{
    base_id = item.base_id || base_id

    if (!base_id) throw new Error("Must provide base_id for kv_app_to_supabase")

    const json = clean_base_object_of_sync_meta_fields(item)

    return {
        id: item.id,
        modified_at: item.modified_at!,
        base_id,
        title: item.title,
        json,
    }
}



export function knowledge_view_supabase_to_app (kv: SupabaseKnowledgeView): KnowledgeView
{
    let { json, id, base_id, modified_at } = kv
    // Ensure all the fields that are edited in the db are set correctly in the json data.
    // Do not update title.  This should only be edited by the client app.  The canonical
    // value is in the DB's json field not the title field.
    json = { ...json, id, base_id, modified_at }
    json = clean_base_object_of_sync_meta_fields(json) // defensive

    json.created_at = json.created_at && new Date(json.created_at)
    json.custom_created_at = json.custom_created_at && new Date(json.custom_created_at)
    json.modified_at = json.modified_at && new Date(json.modified_at)
    json.deleted_at = json.deleted_at && new Date(json.deleted_at)

    return json
}
