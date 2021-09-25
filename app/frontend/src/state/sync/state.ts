


export type SYNC_STATUS = "LOADING" | "LOADED" | "SAVING" | "SAVED" | "FAILED"

export type StorageType = "supabase" //| "local_server" | "solid" | "hard_copy_export" | "hard_copy_import"
    // TODO: remove "local_storage" as option
    //| "local_storage"

export type SyncDataType = "bases" | "specialised_objects"

export interface SyncState extends SyncStateByType
{
    ready_for_reading: boolean
    ready_for_writing: boolean

    // Only one type at the moment
    storage_type: StorageType
}


export interface SyncStateForDataType
{
    status: SYNC_STATUS | undefined
    error_message: string

    retry_attempt: number | undefined
    next_save_ms: number | undefined
}


type SyncStateByType = { [data_type in SyncDataType]: SyncStateForDataType }
