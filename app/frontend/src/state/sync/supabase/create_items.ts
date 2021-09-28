import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js"
import type { Base } from "../../../shared/interfaces/base"



type CreateItemArgs<SWrite, SRead, U> =
{
    supabase: SupabaseClient
    table: string
    item: U
    converter_supabase_to_app: (item: SRead) => U
    converter_app_to_supabase: (item: U) => SWrite
}
interface CreateItemReturn<U>
{
    error: PostgrestError | undefined
    item: U | undefined
    status: number
}
export async function supabase_create_item <SWrite extends { id: string }, SRead extends SWrite, U extends Base> (args: CreateItemArgs<SWrite, SRead, U>): Promise<CreateItemReturn<U>>
{
    const item_to_insert = args.converter_app_to_supabase(args.item)

    const result = await args.supabase
        .from<SWrite>(args.table)
        .insert(item_to_insert)
        .eq("id", item_to_insert.id as any)

    const items: U[] = ((result.data || []) as SRead[]).map(args.converter_supabase_to_app)
    const item = items[0]

    return { status: result.status, item, error: result.error || undefined }
}
