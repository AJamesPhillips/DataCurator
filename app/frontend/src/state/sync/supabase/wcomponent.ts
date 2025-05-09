import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js"

import type { KnowledgeView } from "../../../shared/interfaces/knowledge_view"
import { get_double_at_mentioned_uuids_from_text, is_valid_uuid } from "../../../sharedf/rich_text/id_regexs"
import type { SupabaseReadWComponent, SupabaseWriteWComponent } from "../../../supabase/interfaces"
import { WComponent, wcomponent_is_action, wcomponent_is_state_value } from "../../../wcomponent/interfaces/SpecialisedObjects"
import { parse_wcomponent } from "../../../wcomponent/parse_json/parse_wcomponent"
import { supabase_create_item } from "./create_items"
import { supabase_get_items } from "./get_items"
import type { UpsertItemReturn } from "./interface"
import { app_item_to_supabase, supabase_item_to_app } from "./item_convertion"



const TABLE_NAME = "wcomponents"


type GetWComponentsArgs =
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
export function supabase_get_wcomponents (args: GetWComponentsArgs)
{
    return supabase_get_items<SupabaseReadWComponent, WComponent>({
        ...args,
        table: TABLE_NAME,
        converter: wcomponent_supabase_to_app,
        specific_ids: args.ids,
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
        wcomponents: result.value,
    }
}



interface GetWComponentsFromOtherBases
{
    supabase: SupabaseClient
    base_id: number
    knowledge_views: KnowledgeView[]
    wcomponents: WComponent[]
}
export async function supabase_get_wcomponents_from_other_bases (args: GetWComponentsFromOtherBases)
{
    const downloaded_wcomponent_ids = new Set(args.wcomponents.map(wc => wc.id))

    const missing_wcomponent_ids = new Set<string>()
    function determine_if_missing_ids (ids: string[], source_of_ids: string)
    {
        ids.forEach(id =>
        {
            if (!is_valid_uuid(id))
            {
                console. trace(`Found invalid UUID "${id}".  Source of ids: "${source_of_ids}"`)
                return
            }

            if (!downloaded_wcomponent_ids.has(id)) missing_wcomponent_ids.add(id)
        })
    }


    args.knowledge_views.forEach(kv =>
    {
        determine_if_missing_ids(Object.keys(kv.wc_id_map), `wc_id_map of knowledge view "${kv.id}"`)
        // kv.parent_knowledge_view_id && determine_if_missing_ids([kv.parent_knowledge_view_id])
    })

    args.wcomponents.forEach(wc =>
    {
        const source_of_ids = `wcomponent "${wc.id}"`

        determine_if_missing_ids(wc.label_ids || [], source_of_ids)

        let ids = get_double_at_mentioned_uuids_from_text(wc.title)
        determine_if_missing_ids(ids, source_of_ids)
        ids = get_double_at_mentioned_uuids_from_text(wc.description)
        determine_if_missing_ids(ids, source_of_ids)

        if (wcomponent_is_action(wc)) determine_if_missing_ids(wc.parent_goal_or_action_ids || [], source_of_ids)
    })

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
        let new_supabase_item = result.data as SupabaseReadWComponent
        // When the status code is 409 then `result.error!.details` is an
        // instance of `SupabaseReadWComponent`
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
    return {
        ...app_item_to_supabase(item, base_id),
        type: item.type,
        attribute_id: wcomponent_is_state_value(item) ? item.attribute_wcomponent_id : undefined,
    }
}



export function wcomponent_supabase_to_app (item: SupabaseReadWComponent): WComponent
{
    let wc = supabase_item_to_app(item)
    wc = parse_wcomponent(wc)
    return wc
}
