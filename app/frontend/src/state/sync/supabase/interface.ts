import type { PostgrestError } from "@supabase/supabase-js"



export interface UpsertItemReturn<U>
{
    error: PostgrestError | undefined | unknown
    item: U | undefined
    status: number
}
