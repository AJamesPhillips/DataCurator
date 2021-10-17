import type { RoutingState, RoutingStateArgs } from "./interfaces"
import { merge_route_params_prioritising_url_over_state } from "./routing"



export const STARTING_ZOOM = 100

export function get_routing_starting_state (): RoutingState
{
    const now = new Date()
    const now_ms = now.getTime()

    const routing_args: RoutingStateArgs = {
        view: "knowledge",
        subview_id: "",
        zoom: 100,
        x: 0,
        y: 0,
        storage_location: undefined,

        created_at_datetime: now,
        created_at_ms: now_ms,
        sim_datetime: now,
        sim_ms: now_ms,
    }

    const default_routing_state: RoutingState = {
        route: "wcomponents",
        sub_route: null,
        item_id: null,
        args: routing_args,
    }

    return merge_route_params_prioritising_url_over_state(window.location.toString(), default_routing_state)
}
