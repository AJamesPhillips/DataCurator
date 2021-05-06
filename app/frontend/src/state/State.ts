import type { AnyAction } from "redux"

import type { DerivedState } from "./derived/State"
import type { DisplayState } from "./display/state"
import type { RoutingState } from "./routing/interfaces"
import type { MetaWComponentsState } from "./specialised_objects/meta_wcomponents/State"
import type { SpecialisedObjectsState } from "./specialised_objects/State"



export interface Statement
{
    id: string
    datetime_created: Date
    content: string
    // datetime_custom_created?: Date
    // datetime_modified?: Date
    labels: string[]  // statement_ids[]
}


export interface Pattern
{
    id: string
    datetime_created: Date
    name: string
    content: string
    attributes: PatternAttribute[]
}

export interface PatternAttribute
{
    type_id: string
    alt_name: string
    multiple?: boolean
}


export interface CoreObject
{
    id: string
    datetime_created: Date
    labels: string[]  // statement_ids[]
    attributes: CoreObjectAttribute[]
    pattern_id: string
    external_ids: { [application: string]: string }
}
export interface Objekt extends CoreObject
{
    pattern_name: string  // denormalised from Pattern
    content: string       // denormalised from Pattern
    attributes: ObjectAttribute[]
}
export interface ObjectWithCache extends Objekt
{
    rendered: string
    is_rendered: boolean
}

export interface CoreObjectIdAttribute {
    pidx: number
    id: string /* statement_id */
}
export interface CoreObjectValueAttribute {
    pidx: number
    value: string
}
export type CoreObjectAttribute = CoreObjectIdAttribute | CoreObjectValueAttribute
export type ObjectAttribute = CoreObjectAttribute & {
    pattern: PatternAttribute
}

export const is_id_attribute = (a: CoreObjectAttribute): a is CoreObjectIdAttribute => a.hasOwnProperty("id")
export const is_value_attribute = (a: CoreObjectAttribute): a is CoreObjectValueAttribute => a.hasOwnProperty("value")


export type Item = Statement | Pattern | ObjectWithCache



export type SYNC_STATUS = "LOADING" | "SAVING" | undefined
export interface SyncState
{
    ready: boolean
    saving: boolean
    status: SYNC_STATUS
}



export interface GlobalKeyPress
{
    last_key: string | undefined
    last_key_time_stamp: number | undefined
    keys_down: Set<string>
}


export interface ObjectivesState
{
    selected_objective_ids: Set<string>
    priority_selected_objective_ids: Set<string>
}



export type StatementState = Statement[]
export type PatternState = Pattern[]
export type ObjectsState = ObjectWithCache[]
export interface RootStateCore
{
    statements: StatementState
    patterns: PatternState
    objects: ObjectsState
    specialised_objects: SpecialisedObjectsState
}
export interface RootState extends RootStateCore
{
    last_action: AnyAction | undefined
    display: DisplayState
    sync: SyncState
    routing: RoutingState
    global_keys: GlobalKeyPress
    objectives: ObjectivesState
    meta_wcomponents: MetaWComponentsState
    derived: DerivedState
}
