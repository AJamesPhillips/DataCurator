import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js"

import type { KnowledgeView } from "../../../shared/interfaces/knowledge_view"
import { is_defined } from "../../../shared/utils/is_defined"
import type { SupabaseReadKnowledgeView, SupabaseWriteKnowledgeView } from "../../../supabase/interfaces"
import { WComponent, wcomponent_is_not_deleted } from "../../../wcomponent/interfaces/SpecialisedObjects"
import { parse_knowledge_view } from "../../../wcomponent/parse_json/parse_knowledge_view"
import { supabase_create_item } from "./create_items"
import { supabase_get_items } from "./get_items"
import type { UpsertItemReturn } from "./interface"
import { app_item_to_supabase, supabase_item_to_app } from "./item_convertion"



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



interface GetKnowledgeViewsFromOtherBases
{
    supabase: SupabaseClient
    knowledge_views: KnowledgeView[]
    wcomponents_from_other_bases: WComponent[]
}
export async function supabase_get_knowledge_views_from_other_bases (args: GetKnowledgeViewsFromOtherBases)
{
    const wcomponents_from_other_bases = args.wcomponents_from_other_bases
        .filter(wc => wcomponent_is_not_deleted(wc))
    const wcomponent_ids = Array.from(new Set(wcomponents_from_other_bases.map(wc => wc.id)))

    const downloaded_knowledge_view_ids = new Set(args.knowledge_views.map(kv => kv.id))
    const parent_kv_ids: string[] = args.knowledge_views.map(kv => kv.parent_knowledge_view_id)
        .filter(is_defined)
        .filter(id => !downloaded_knowledge_view_ids.has(id))
    let kv_ids = wcomponent_ids.concat(parent_kv_ids)

    args.knowledge_views.map(kv => kv.foundation_knowledge_view_ids)
        .forEach(ids =>
        {
            ids?.filter(id => !downloaded_knowledge_view_ids.has(id))
                .forEach(id => kv_ids.push(id))
        })

    kv_ids = Array.from(new Set(kv_ids))

    return await supabase_get_knowledge_views({ supabase: args.supabase, ids: kv_ids, all_bases: true })
}



interface SupabaseUpsertKnowledgeViewArgs
{
    // We do not yet use the type `SupabaseClient<Database>` because it is not
    // yet working correctly.  For example it incorrectly restricts the
    // KnowledgeView type from being used for a json field type.
    supabase: SupabaseClient//<Database>
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

    const result = await args.supabase.rpc<"update_knowledge_view", SupabaseReadKnowledgeView>("update_knowledge_view", { item })
    if (result.status === 401)
    {
        return { status: result.status, error: { message: "JWT expired" }, item: undefined }
    }


    let new_item: KnowledgeView | undefined = undefined
    let error: PostgrestError | Error | undefined = result.error || undefined
    try
    {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        let new_supabase_item: SupabaseReadKnowledgeView = result.data as any
        // When the status code is 409 then `result.error!.details` is an
        // instance of `SupabaseReadKnowledgeView`
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
