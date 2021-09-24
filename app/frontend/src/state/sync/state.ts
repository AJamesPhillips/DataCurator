


export type SYNC_STATUS = "LOADING" | "LOADED" | "SAVING" | "SAVED" | "FAILED"

export type StorageType = "supabase" //| "local_server" | "solid" | "hard_copy_export" | "hard_copy_import"
    // TODO: remove "local_storage" as option
    //| "local_storage"

export interface SyncState
{
    status: SYNC_STATUS | undefined
    ready_for_reading: boolean
    ready_for_writing: boolean
    saving: boolean
    error_message: string

    storage_type: StorageType

    retry_attempt: number | undefined
    next_save_ms: number | undefined
}
