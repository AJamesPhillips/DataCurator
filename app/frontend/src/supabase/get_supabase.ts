import { createClient, SupabaseClient } from "@supabase/supabase-js"



let supabase: SupabaseClient

export function get_supabase ()
{
    if (supabase) return supabase

    // TODO SECURITY move these to an env file?  Why?  We already send them to
    // anyone who wants them via the website.
    const supabase_url = "https://sfkgqscbwofiphfxhnxg.supabase.co"
    const SUPABASE_ANONYMOUS_CLIENT_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYzMjA2MTkwNSwiZXhwIjoxOTQ3NjM3OTA1fQ.or3FBQDa4CtAA8w7XQtYl_3NTmtFFYPWoafolOpPKgA"
    supabase = createClient(supabase_url, SUPABASE_ANONYMOUS_CLIENT_KEY, { autoRefreshToken: true })

    return supabase
}
