


export type SYNC_STATUS = "LOADING" | "SAVING" | "SAVED" | "FAILED" | undefined

export type StorageType = "local_server" | "local_storage" | "solid"

export interface SyncState
{
    status: SYNC_STATUS
    ready: boolean
    saving: boolean
    error_message: string
    storage_type: StorageType | undefined
    copy_from_storage_type: StorageType | false
    retry_attempt: number | undefined
}
