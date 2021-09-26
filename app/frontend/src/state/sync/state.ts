import type { KnowledgeView } from "../../shared/wcomponent/interfaces/knowledge_view"
import type { WComponent } from "../../shared/wcomponent/interfaces/SpecialisedObjects"
import type { SpecialisedObjectsState } from "../specialised_objects/State"



export type SYNC_STATUS = "LOADING" | "LOADED" | "SAVING" | "SAVED" | "FAILED"

export type StorageType = "supabase" //| "local_server" | "solid" | "hard_copy_export" | "hard_copy_import"
    // TODO: remove "local_storage" as option
    //| "local_storage"

export type SyncDataType = "bases" | "specialised_objects"

export interface SyncState extends SyncStateByType
{
    specialised_objects_pending_save: {
        wcomponent_ids: Set<string>
        knowledge_view_ids: Set<string>
    },
    specialised_objects_save_conflicts: {
        wcomponent_conflicts_by_id: {[id: string]: WComponent[]}
        knowledge_view_conflicts_by_id: {[id: string]: KnowledgeView[]}
    },

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
