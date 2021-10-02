import type { PostgrestError } from "@supabase/supabase-js"



export interface SyncError
{
    type: "insufficient_information" | "loading_error" | "general"
    message?: string
}



export function error_to_string (error: Partial<PostgrestError> | SyncError | Error | undefined)
{
    if (error && ("type" in error) && typeof error.type === "string")
    {
        return error.type + ": " + (error.message || "<no message>")
    }

    return `${error}`
}
