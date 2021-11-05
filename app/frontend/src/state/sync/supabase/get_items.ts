import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js"
import { SUPABASE_MAX_ROWS } from "./constants"



type GetItemsArgs<S, U> =
{
    supabase: SupabaseClient
    table: string
    converter: (item: S) => U
    offset?: number
    specific_id?: string // todo rename function to semantically match getting multiple items or just one
} & ({
    base_id: number
    all_bases?: false
} | {
    base_id?: undefined
    all_bases: true
})
interface GetItemsReturn<U>
{
    error: PostgrestError | undefined
    items: U[]
}
export async function supabase_get_items <S extends { id: string, base_id: number }, U> (args: GetItemsArgs<S, U>): Promise<GetItemsReturn<U>>
{
    const offset = args.offset || 0

    let query = args.supabase
        .from<S>(args.table)
        .select("*")
        .order("id", { ascending: true })
        .range(offset, offset + SUPABASE_MAX_ROWS - 1)

    if (args.base_id !== undefined) query = query.eq("base_id", args.base_id as any)
    if (args.specific_id !== undefined) query = query.eq("id", args.specific_id as any)

    const res1 = await query
    let error = res1.error || undefined
    let items = (res1.data || []).map(args.converter)

    if (!error && items.length === SUPABASE_MAX_ROWS)
    {
        const res2 = await supabase_get_items({ ...args, offset: offset + SUPABASE_MAX_ROWS })
        if (!res2.error) items = items.concat(res2.items)
        else error = res2.error
    }

    return { error, items }
}
