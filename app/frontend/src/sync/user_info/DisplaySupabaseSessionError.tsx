import { h } from "preact"



export function DisplaySupabaseSessionError (props: { error: Error | null })
{
    const { error } = props
    if (error === null) return null


    const already_registered = error?.message.includes("Thanks for registering") && (error as any)?.status === 400
    if (already_registered) return <div>Please check your email</div>
    // Perhaps need to handle `supabase_session_error?.message === 'JWT expired'` but hopefully `autoRefreshToken` will work


    return <div>Error : {error.message || error}</div>
}
