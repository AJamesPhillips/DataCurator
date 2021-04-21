import type { AnyAction } from "redux"
import type { DerivedState } from "./derived/State"
import type { DisplayState } from "./display/state"

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


export type ROUTE_TYPES = (
    "filter"
    | "statements"
    | "objects"
    | "patterns"
    | "creation_context"
    | "views"
    //+ specialised objects
    | "perceptions"
    | "wcomponents"
    //- specialised objects
)
export type SUB_ROUTE_TYPES = "objects_bulk_import" | "objects_bulk_import/setup" | "wcomponents_edit_multiple" | null
export const ALLOWED_ROUTES: ROUTE_TYPES[] = [
    "filter",
    "statements",
    "objects",
    "patterns",
    "creation_context",
    "views",
    "perceptions",
    "wcomponents",
]
export const ALLOWED_SUB_ROUTES: {[k in ROUTE_TYPES]: SUB_ROUTE_TYPES[]} = {
    "filter": [],
    "statements": [],
    "objects": ["objects_bulk_import", "objects_bulk_import/setup"],
    "patterns": [],
    "creation_context": [],
    "views": [],
    "perceptions": [],
    "wcomponents": ["wcomponents_edit_multiple"],
}
export interface RoutingState
{
    route: ROUTE_TYPES
    sub_route: SUB_ROUTE_TYPES
    item_id: string | null
    args: RoutingArgs
}

// TODO: merge with ROUTE_TYPES?
export type ViewType = "priorities" | "knowledge" | "objectives"
const _view_types: {[k in ViewType]: true} = {
    "priorities": true,
    "knowledge": true,
    "objectives": true,
}
export const routing_view_types = Object.keys(_view_types)

export type OrderType = "normal" | "reverse"
const _order_types: {[k in OrderType]: true} = {
    "normal": true,
    "reverse": true,
}
export const routing_order_types = Object.keys(_order_types)

export type RoutingArgs = {
    cdate: string
    ctime: string
    sdate?: string
    stime?: string
    view: ViewType
    subview_id: string
    zoom: number
    x: number
    y: number
    order: OrderType
    rotation: string
}
export type RoutingArgKey = keyof RoutingArgs
const ALLOWED_ROUTE_ARG_KEYS: RoutingArgKey[] = [
    "cdate",
    "ctime",
    "sdate",
    "stime",
    "view",
    "subview_id",
    "zoom",
    "x",
    "y",
    "order",
    "rotation",
]
export function is_route_arg_key (key: string): key is RoutingArgKey
{
    return ALLOWED_ROUTE_ARG_KEYS.includes(key as RoutingArgKey)
}


export interface GlobalKeyPress
{
    last_key: string | undefined
    last_key_time_stamp: number | undefined
    keys_down: Set<string>
}


export interface CurrentDateTime
{
    dt: Date
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
    current_datetime: CurrentDateTime
    objectives: ObjectivesState
    meta_wcomponents: MetaWComponentsState
    derived: DerivedState
}
