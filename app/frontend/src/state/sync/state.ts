


export type SYNC_STATUS = "LOADING" | "SAVING" | "FAILED" | undefined

export interface SyncState
{
    ready: boolean
    saving: boolean
    status: SYNC_STATUS
    error_message: string
}
