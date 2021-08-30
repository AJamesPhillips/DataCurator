


export type SYNC_STATUS = "LOADING" | "LOADED" | "SAVING" | "SAVED" | "FAILED" | "RETRYING" | "OVERWRITING"

export type StorageType = "local_server" | "local_storage" | "solid"

export interface SyncState
{
    status: SYNC_STATUS | undefined
    ready_for_reading: boolean
    ready_for_writing: boolean
    saving: boolean
    error_message: string
    storage_type: StorageType | undefined
    copy_from_storage_type: StorageType | false
    retry_attempt: number | undefined
    next_save_ms: number | undefined
}
