import type { AnyAction } from "redux"

import type { CreationContextState } from "./creation_context/state"
import type { ControlsState } from "./controls/state"
import type { DerivedState } from "./derived/State"
import type { DisplayOptionsState } from "./display_options/state"
import type { FilterContextState } from "./filter_context/state"
import type { GlobalKeysState } from "./global_keys/state"
import type { RoutingState } from "./routing/interfaces"
import type { SearchState } from "./search/state"
import type { MetaWComponentsState } from "./specialised_objects/meta_wcomponents/State"
import type { SpecialisedObjectsState } from "./specialised_objects/State"
import type { SyncState } from "./sync/state"
import type { UserActivityState } from "./user_activity/state"
import type { UserInfoState } from "./user_info/state"



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
    specialised_objects: SpecialisedObjectsState

    // TODO remove
    statements: StatementState
    patterns: PatternState
    objects: ObjectsState
}
export interface RootState extends RootStateCore
{
    controls: ControlsState
    creation_context: CreationContextState
    derived: DerivedState
    display_options: DisplayOptionsState
    filter_context: FilterContextState
    global_keys: GlobalKeysState
    last_action: AnyAction | undefined
    meta_wcomponents: MetaWComponentsState
    objectives: ObjectivesState
    routing: RoutingState
    search: SearchState
    sync: SyncState
    user_activity: UserActivityState
    user_info: UserInfoState
}
