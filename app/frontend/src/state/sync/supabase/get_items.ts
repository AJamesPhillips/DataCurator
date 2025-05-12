import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js"

import { SUPABASE_MAX_ROWS } from "./constants"



type GetItemsArgs<S, U> =
{
    supabase: SupabaseClient
    table: string
    converter: (item: S) => U
    offset?: number
    specific_ids?: string[]
} & ({
    base_id: number
    all_bases?: false
} | {
    base_id?: undefined
    all_bases: true
})
export interface GetItemsReturn<V>
{
    error: PostgrestError | undefined
    value: V
}
export async function supabase_get_items <S extends { id: string, base_id: number }, U> (args: GetItemsArgs<S, U>): Promise<GetItemsReturn<U[]>>
{
    const offset = args.offset || 0
    // Arbitrarily limited max specific_ids to 100 to prevent errors with URLS being too long
    // todo: research and optimise this.
    const MAX_ROWS = args.specific_ids ? 100 : SUPABASE_MAX_ROWS
    const offset_max_inclusive = offset + MAX_ROWS - 1

    // if (args.specific_ids) console .log("args.specific_ids....", args.specific_ids.length, offset)

    let query = args.supabase
        .from<string, S>(args.table)
        .select<string, S>()
        .order("id", { ascending: true })


    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    if (args.base_id !== undefined) query = query.eq("base_id", args.base_id as any)


    if (args.specific_ids === undefined)
    {
        query = query.range(offset, offset_max_inclusive)
    }
    else
    {
        const specific_ids = args.specific_ids.slice(offset, offset_max_inclusive + 1)
        // console .log("specific_ids", offset, offset_max_inclusive + 1, specific_ids.slice(0, 3))
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        query = query.in("id", specific_ids as any)
    }


    const res1 = await query
    let error = res1.error || undefined
    let items = (res1.data || []).map(v => args.converter(v))

    // You may have a knowledge view with one or more ids you can not access, however
    // there will be other ids you can access so keep going until they have all been
    // attempted to be accessed.
    const specific_ids_remaining_to_fetch = args.specific_ids && (offset + MAX_ROWS) < args.specific_ids.length

    if (!error && (items.length === MAX_ROWS || specific_ids_remaining_to_fetch))
    {
        const res2 = await supabase_get_items({ ...args, offset: offset + MAX_ROWS })
        if (!res2.error) items = items.concat(res2.value)
        else error = res2.error
    }

    return { error, value: items }
}
