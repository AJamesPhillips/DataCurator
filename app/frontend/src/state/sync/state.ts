


export type SYNC_STATUS = "LOADING" | "SAVING" | "SAVED" | "FAILED" | undefined

export type StorageType = "local_server" | "local_storage" | "solid"

export interface SyncState
{
    ready: boolean
    saving: boolean
    status: SYNC_STATUS
    error_message: string
    storage_type: StorageType | undefined
}
