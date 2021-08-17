

export interface SyncError
{
    type: "insufficient_information" | "loading_error" | "general"
    message?: string
}



export function error_to_string (error: SyncError | Error)
{
    if (error && ("type" in error) && typeof error.type === "string")
    {
        return error.type + ": " + (error.message || "<no message>")
    }

    return `${error}`
}
