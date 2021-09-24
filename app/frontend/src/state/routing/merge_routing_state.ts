import { test } from "../../shared/utils/test"
import type { ActionChangeRouteArgs } from "./actions"
import { get_datetime_or_ms } from "./datetime/routing_datetime"
import type {
    RoutingState,
    RoutingStateArgKey,
    ROUTE_TYPES,
    SUB_ROUTE_TYPES,
    ViewType,
} from "./interfaces"



export function merge_routing_state (current_routing_state: RoutingState, new_routing_state: ActionChangeRouteArgs, logger?: (msg: string) => void): RoutingState
{
    const {
        route,
        sub_route,
        item_id,
        args,
    } = current_routing_state

    const new_args = new_routing_state.args || {}

    new_args.created_at_ms = get_datetime_or_ms(new_args.created_at_datetime, new_args.created_at_ms, logger)
    new_args.created_at_datetime = new_args.created_at_ms ? new Date(new_args.created_at_ms) : undefined
    new_args.sim_ms = get_datetime_or_ms(new_args.sim_datetime, new_args.sim_ms, logger)
    new_args.sim_datetime = new_args.sim_ms ? new Date(new_args.sim_ms) : undefined

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
    const dt2 = new Date("2022-01-01 01:01:01")
    const dt3 = new Date("2023-01-01 01:01:01")
    const current_routing_state: RoutingState = {
        route: "wcomponents",
        sub_route: null,
        item_id: "wc53611570523449304",
        args:
        {
            created_at_datetime: dt,
            created_at_ms: dt.getTime(),
            sim_datetime: dt,
            sim_ms: dt.getTime(),

            view: "knowledge",
            subview_id: "kv7207606403961189",
            zoom: 100,
            x: 0,
            y: 0,
            storage_location: undefined,
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

    // Should warn and handle setting datetime date and milliseconds
    new_routing_state = { args: { created_at_datetime: dt2, created_at_ms: dt3.getTime() } }
    let msg_called = ""
    const spy_logger = (msg: string) => msg_called = msg
    merged_routing_state = merge_routing_state(current_routing_state, new_routing_state, spy_logger)
    test(merged_routing_state.args.created_at_datetime, dt3)
    test(merged_routing_state.args.created_at_ms, dt3.getTime())
    test(msg_called, "do not set both new_ms and new_datetime")
    msg_called = ""

    new_routing_state = { args: { sim_datetime: dt2, sim_ms: dt3.getTime() } }
    merged_routing_state = merge_routing_state(current_routing_state, new_routing_state, spy_logger)
    test(merged_routing_state.args.sim_datetime, dt3)
    test(merged_routing_state.args.sim_ms, dt3.getTime())
    test(msg_called, "do not set both new_ms and new_datetime")
    msg_called = ""
}


// run_tests()
