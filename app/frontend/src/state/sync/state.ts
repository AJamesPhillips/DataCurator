import type { KnowledgeView, KnowledgeViewsById } from "../../shared/interfaces/knowledge_view"
import type { WComponent, WComponentsById } from "../../shared/wcomponent/interfaces/SpecialisedObjects"



export type SYNC_STATUS = "LOADING" | "LOADED" | "SAVING" | "SAVED" | "FAILED"

export type StorageType = "supabase" //| "local_server" | "solid" | "hard_copy_export" | "hard_copy_import"
    // TODO: remove "local_storage" as option
    //| "local_storage"

export type SyncDataType = "bases" | "specialised_objects"

export interface SyncState extends SyncStateByType
{
    last_source_of_truth_specialised_objects_by_id: LastSourceOfTruthSpecialisedObjectsById
    specialised_object_ids_pending_save: SpecialisedObjectIdsPendingSave
    specialised_objects_save_conflicts: SpecialisedObjectsSaveConflicts

    ready_for_reading: boolean
    ready_for_writing: boolean

    network_functional: boolean
    network_function_last_checked: Date | undefined

    // Only one type at the moment
    storage_type: StorageType
}


export interface LastSourceOfTruthSpecialisedObjectsById
{
    wcomponents: WComponentsById
    knowledge_views: KnowledgeViewsById
}


export interface SpecialisedObjectIdsPendingSave
{
    wcomponent_ids: Set<string>
    knowledge_view_ids: Set<string>
}


export interface SpecialisedObjectsSaveConflicts
{
    wcomponent_conflicts_by_id: {[id: string]: WComponent[]}
    knowledge_view_conflicts_by_id: {[id: string]: KnowledgeView[]}
}


export interface SyncStateForDataType
{
    status: SYNC_STATUS | undefined
    error_message: string

    retry_attempt: number | undefined
}


type SyncStateByType = { [data_type in SyncDataType]: SyncStateForDataType }
