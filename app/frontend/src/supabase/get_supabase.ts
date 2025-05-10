// Copied at VisualiseWorld/src/data/get_supabase.ts
import { createClient, SupabaseClient } from "@supabase/supabase-js"
import { Database } from "../../types/database.types"



let supabase: SupabaseClient<Database> | undefined = undefined

export function get_supabase ()
{
    if (supabase) return supabase

    const supabase_url = "https://sfkgqscbwofiphfxhnxg.supabase.co"
    // We send this to anyone who wants them (via the website) so no need to keep private.
    const SUPABASE_ANONYMOUS_CLIENT_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYzMjA2MTkwNSwiZXhwIjoxOTQ3NjM3OTA1fQ.or3FBQDa4CtAA8w7XQtYl_3NTmtFFYPWoafolOpPKgA"
    supabase = createClient<Database>(supabase_url, SUPABASE_ANONYMOUS_CLIENT_KEY)

    return supabase
}
