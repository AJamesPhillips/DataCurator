import { test } from "../../shared/utils/test"
import type { ActionChangeRouteArgs } from "./actions"
import type {
    RoutingState,
    RoutingStateArgKey,
    ROUTE_TYPES,
    SUB_ROUTE_TYPES,
    ViewType,
    OrderType,
} from "./interfaces"



export function merge_routing_state (current_routing_state: RoutingState, new_routing_state: ActionChangeRouteArgs): RoutingState
{
    const {
        route,
        sub_route,
        item_id,
        args,
    } = current_routing_state

    const new_args = new_routing_state.args || {}
    Object.keys(new_args).forEach(key => {
        const value = new_args[key as RoutingStateArgKey]
        const no_value = value === undefined || value === ""
        if (no_value) delete new_args[key as RoutingStateArgKey]
    })
    const merged_args = { ...args, ...new_args }

    return {
        route: new_routing_state.route || route,
        sub_route: new_routing_state.sub_route === null ? null : (new_routing_state.sub_route || sub_route),
        item_id: new_routing_state.item_id === null ? null : (new_routing_state.item_id || item_id),
        args: merged_args,
    }
}



function run_tests ()
{
    console. log("running tests of merge_routing_state")

    const dt = new Date("2021-04-09 23:25:26")
    const current_routing_state: RoutingState = {
        route: "wcomponents" as ROUTE_TYPES,
        sub_route: null as SUB_ROUTE_TYPES,
        item_id: "wc53611570523449304",
        args:
        {
            created_at_datetime: dt,
            created_at_ms: dt.getTime(),
            sim_datetime: dt,
            sim_ms: dt.getTime(),
            view: "knowledge" as ViewType,
            subview_id: "kv7207606403961189",
            zoom: 100,
            x: 0,
            y: 0,
            order: "normal" as OrderType,
            rotation: 0
        }
    }

    let new_routing_state: ActionChangeRouteArgs
    let merged_routing_state: RoutingState

    // Should not remove key's with values === 0
    new_routing_state = { args: { x: 0 } }
    merged_routing_state = merge_routing_state(current_routing_state, new_routing_state)
    test(merged_routing_state, current_routing_state)

    // Should not overwrite key's with undefined
    new_routing_state = { args: { zoom: undefined } }
    merged_routing_state = merge_routing_state(current_routing_state, new_routing_state)
    test(merged_routing_state, current_routing_state)
}


run_tests()
