import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js"
import type { Base } from "../../../shared/interfaces/base"



type CreateItemArgs<S, U> =
{
    supabase: SupabaseClient
    table: string
    item: U
    converter_supabase_to_app: (item: S) => U
    converter_app_to_supabase: (item: U) => S
}
interface CreateItemReturn<U>
{
    error: PostgrestError | undefined
    item: U | undefined
}
export async function supabase_create_item <S extends { id: string }, U extends Base> (args: CreateItemArgs<S, U>): Promise<CreateItemReturn<U>>
{
    const item_to_insert = args.converter_app_to_supabase(args.item)

    const result = await args.supabase
        .from<S>(args.table)
        .insert(item_to_insert)
        .eq("id", item_to_insert.id as any)

    const items: U[] = (result.data || []).map(args.converter_supabase_to_app)
    const item = items[0]

    return { item, error: result.error || undefined }
}
