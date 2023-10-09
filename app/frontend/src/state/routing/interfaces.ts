

export type ROUTE_TYPES = (
    "filter"
    | "select"
    | "display"
    | "statements"
    | "objects"
    | "patterns"
    | "creation_context"
    | "views"
    //+ specialised objects
    | "wcomponents"
    //- specialised objects
    | "about"
    | "search"
)
export type SUB_ROUTE_TYPES = "objects_bulk_import" | "objects_bulk_import/setup" | "wcomponents_edit_multiple" | null
export const ALLOWED_SUB_ROUTES: {[k in ROUTE_TYPES]: SUB_ROUTE_TYPES[]} = {
    "views": [],
    "wcomponents": ["wcomponents_edit_multiple"],
    "search": [],
    "filter": [],
    "select": [],
    "display": [],
    "statements": [],
    "objects": ["objects_bulk_import", "objects_bulk_import/setup"],
    "patterns": [],
    "creation_context": [],
    "about": [],
}
export const ALLOWED_ROUTES: ROUTE_TYPES[] = Object.keys(ALLOWED_SUB_ROUTES) as ROUTE_TYPES[]


export interface RoutingState
{
    route: ROUTE_TYPES
    sub_route: SUB_ROUTE_TYPES
    item_id: string | null
    args: RoutingStateArgs
}

// TODO: merge with ROUTE_TYPES?
export type ViewType = "priorities" | "priorities_list" | "actions_list" | "knowledge" | "objectives"
const _view_types: {[k in ViewType]: true} = {
    "priorities": true,
    "priorities_list": true,
    "actions_list": true,
    "knowledge": true,
    "objectives": true,
}
const routing_view_types = Object.keys(_view_types)
export const is_routing_view_types = (str: string): str is ViewType => routing_view_types.includes(str)


export interface RoutingStateArgs
{
    view: ViewType
    // todo, document why the knowledge view id that is used to populate subview_id
    // is refered to as a subview?
    subview_id: string
    zoom: number
    x: number
    y: number
    storage_location: number | undefined

    created_at_datetime: Date
    created_at_ms: number
    sim_datetime: Date
    sim_ms: number
}
export type RoutingStateArgKey = keyof RoutingStateArgs


interface RoutingStringArgs
{
    view: string
    subview_id: string
    zoom: string
    x: string
    y: string
    storage_location: string

    // order: string
    // rotation: string

    cdate: string
    ctime: string
    sdate?: string
    stime?: string
}
export type RoutingStringArgKey = keyof RoutingStringArgs
export const ALLOWED_ROUTE_ARGS: {[k in RoutingStringArgKey]: true} = {
    view: true,
    subview_id: true,
    zoom: true,
    x: true,
    y: true,
    storage_location: true,
    cdate: true,
    ctime: true,
    sdate: true,
    stime: true,
}
export const ALLOWED_ROUTE_ARGS_COUNT = Object.keys(ALLOWED_ROUTE_ARGS).length
