import type { RoutingArgs, RoutingState } from "../State"
import { get_current_route_params } from "./routing"
import { created_at_datetime_to_routing_args } from "./routing_datetime"



export function get_routing_starting_state (): RoutingState
{
    const routing_args: RoutingArgs = {
        ...created_at_datetime_to_routing_args(new Date()),
        view: "priorities",
        subview_id: "",
        zoom: 100,
        x: 0,
        y: 0,
        order: "normal",
        rotation: "0",
    }

    const default_routing_state: RoutingState = {
        route: "statements",
        sub_route: null,
        item_id: null,
        args: routing_args,
    }

    return get_current_route_params(default_routing_state)
}
