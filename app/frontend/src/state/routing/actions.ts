import type { Action, AnyAction } from "redux"

import type { ROUTE_TYPES, SUB_ROUTE_TYPES, RoutingArgs } from "../State"



export interface ActionChangeRouteArgs {
    route?: ROUTE_TYPES
    sub_route?: SUB_ROUTE_TYPES | null
    item_id?: string | null
    args?: Partial<RoutingArgs>
}
interface ActionChangeRoute extends Action, ActionChangeRouteArgs {}

const change_route_type = "change_route"

const change_route = (routing_params: ActionChangeRouteArgs): ActionChangeRoute =>
{
    return { type: change_route_type, ...routing_params }
}

export const is_change_route = (action: AnyAction): action is ActionChangeRoute =>
{
    return action.type === change_route_type
}


export const routing_actions = {
    change_route,
}
