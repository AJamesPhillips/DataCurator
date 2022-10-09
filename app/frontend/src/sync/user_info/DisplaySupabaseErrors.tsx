import type { ApiError, PostgrestError } from "@supabase/supabase-js"
import { h } from "preact"



// TODO merge with error_to_string
export function DisplaySupabaseSessionError (props: { error: ApiError | null })
{
    const { error } = props
    if (error === null) return null


    const already_registered = error?.message.includes("Thanks for registering") && (error as any)?.status === 400
    if (already_registered) return <div>Please check your email</div>
    // Perhaps need to handle `supabase_session_error?.message === 'JWT expired'` but hopefully `autoRefreshToken` will work


    return <div>Error : {error.message || error}</div>
}



// TODO merge with error_to_string
export function DisplaySupabasePostgrestError (props: { error?: PostgrestError | null })
{
    const { error } = props
    if (!error) return null

    const message_value = error.message || error || "An error occured"
    let message_string = `${message_value}`
    if (message_string === "[object Object]") message_string = JSON.stringify(message_value)

    return <div>
        Error: {message_string}
    </div>
}
