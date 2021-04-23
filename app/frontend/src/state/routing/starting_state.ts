import type { RoutingState, RoutingStateArgs } from "./interfaces"
import { get_current_route_params } from "./routing"



export function get_routing_starting_state (): RoutingState
{
    const now = new Date()
    const now_ms = now.getTime()

    const routing_args: RoutingStateArgs = {
        view: "priorities",
        subview_id: "",
        zoom: 100,
        x: 0,
        y: 0,
        order: "normal",
        rotation: 0,

        created_at_datetime: now,
        created_at_ms: now_ms,
        sim_datetime: now,
        sim_ms: now_ms,
    }

    const default_routing_state: RoutingState = {
        route: "statements",
        sub_route: null,
        item_id: null,
        args: routing_args,
    }

    return get_current_route_params(default_routing_state)
}
