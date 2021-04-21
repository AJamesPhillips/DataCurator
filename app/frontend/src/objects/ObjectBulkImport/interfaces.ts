import type { Pattern, ObjectWithCache } from "../../state/State"



export interface Model
{
    name: string
    table_id: string
    view_id: string
    pattern_id: string
}


export interface AirtableToTempIdsMap
{
    [airtable_id: string]: number
}


export type DateString = string


export interface TempIdFunc {
    (id: string | undefined): string
}


export interface TransformAirtableRecordArgs<T>
{
    pattern: Pattern
    get_temp_id: TempIdFunc
    airtable_record: T
    existing_object?: ObjectWithCache
}


export interface BulkImportSettings
{
    auth_key: string
    app: string
    models: Model[]
}
