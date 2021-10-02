import type { PostgrestError } from "@supabase/supabase-js"



export interface UpsertItemReturn<U>
{
    error: Partial<PostgrestError> | Error | undefined
    item: U | undefined
    status: number
}
