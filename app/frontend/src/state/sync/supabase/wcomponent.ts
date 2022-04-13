import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js"

import type { WComponent } from "../../../wcomponent/interfaces/SpecialisedObjects"
import { parse_wcomponent } from "../../../wcomponent/parse_json/parse_wcomponent"
import type { SupabaseReadWComponent, SupabaseWriteWComponent } from "../../../supabase/interfaces"
import { supabase_create_item } from "./create_items"
import { supabase_get_items } from "./get_items"
import type { UpsertItemReturn } from "./interface"
import { app_item_to_supabase, supabase_item_to_app } from "./item_convertion"
import type { KnowledgeView } from "../../../shared/interfaces/knowledge_view"



const TABLE_NAME = "wcomponents"


type GetWComponentsArgs =
{
    supabase: SupabaseClient
} & ({
    base_id: number
    all_bases?: false
} | {
    base_id?: undefined
    all_bases: true
})
export function supabase_get_wcomponents (args: GetWComponentsArgs)
{
    return supabase_get_items<SupabaseReadWComponent, WComponent>({
        ...args,
        table: TABLE_NAME,
        converter: wcomponent_supabase_to_app,
    })
}



type GetWComponentsFromAnyBaseArgs =
{
    supabase: SupabaseClient
    ids: string[]
}
export async function supabase_get_wcomponents_from_any_base (args: GetWComponentsFromAnyBaseArgs)
{
    const result = await supabase_get_items<SupabaseReadWComponent, WComponent>({
        supabase: args.supabase,
        all_bases: true,
        base_id: undefined,
        specific_ids: args.ids,
        table: TABLE_NAME,
        converter: wcomponent_supabase_to_app,
    })

    return {
        error: result.error,
        wcomponents: result.items,
    }
}



interface GetWcomponentsFromOtherBases
{
    supabase: SupabaseClient
    base_id: number
    knowledge_views: KnowledgeView[]
    wcomponents: WComponent[]
}
export async function supabase_get_wcomponents_from_other_bases (args: GetWcomponentsFromOtherBases)
{
    const downloaded_wcomponent_ids = new Set<string>()
    args.wcomponents.forEach(wc => downloaded_wcomponent_ids.add(wc.id))

    const missing_wcomponent_ids = new Set<string>()
    args.knowledge_views.map(kv => Object.keys(kv.wc_id_map).forEach(id =>
    {
        if (!downloaded_wcomponent_ids.has(id)) missing_wcomponent_ids.add(id)
    }))

    // console .log(`missing_wcomponent_ids: ${missing_wcomponent_ids.size}`)

    const ids = Array.from(missing_wcomponent_ids)

    return await supabase_get_wcomponents_from_any_base({ supabase: args.supabase, ids })
}



interface SupabaseUpsertWComponentArgs
{
    supabase: SupabaseClient
    wcomponent: WComponent
}
type SupabaseUpsertWComponentReturn = Promise<UpsertItemReturn<WComponent>>
export async function supabase_upsert_wcomponent (args: SupabaseUpsertWComponentArgs): SupabaseUpsertWComponentReturn
{
    return args.wcomponent.modified_at ? supabase_update_wcomponent(args) : supabase_create_wcomponent(args)
}



async function supabase_create_wcomponent (args: SupabaseUpsertWComponentArgs): SupabaseUpsertWComponentReturn
{
    return supabase_create_item({
        supabase: args.supabase,
        table: TABLE_NAME,
        item: args.wcomponent,
        converter_app_to_supabase: wcomponent_app_to_supabase,
        converter_supabase_to_app: wcomponent_supabase_to_app,
    })
}



async function supabase_update_wcomponent (args: SupabaseUpsertWComponentArgs): SupabaseUpsertWComponentReturn
{
    const item = wcomponent_app_to_supabase(args.wcomponent)

    const result = await args.supabase.rpc("update_wcomponent", { item })
    if (result.status === 401)
    {
        return { status: result.status, error: { message: "JWT expired" }, item: undefined }
    }


    let new_item: WComponent | undefined = undefined
    let error: PostgrestError | Error | undefined = result.error || undefined
    try
    {
        let new_supabase_item: SupabaseReadWComponent = result.data as any
        if (result.status === 409) new_supabase_item = JSON.parse(result.error!.details)
        new_item = wcomponent_supabase_to_app(new_supabase_item)
    }
    catch (err)
    {
        console.error("Exception whilst handling rpc update_wcomponent response", err)
        error = err as Error
    }


    return { status: result.status, error, item: new_item }
}



function wcomponent_app_to_supabase (item: WComponent, base_id?: number): SupabaseWriteWComponent
{
    return app_item_to_supabase(item, base_id)
}



export function wcomponent_supabase_to_app (item: SupabaseReadWComponent): WComponent
{
    let wc = supabase_item_to_app(item)
    wc = parse_wcomponent(wc)
    return wc
}
