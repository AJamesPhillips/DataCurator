import { test } from "../../shared/utils/test"
import {
    ALLOWED_ROUTES,
    ALLOWED_SUB_ROUTES,
    is_route_arg_key,
    OrderType,
    ROUTE_TYPES,
    RoutingArgKey,
    RoutingArgs,
    RoutingState,
    routing_order_types,
    routing_view_types,
    SUB_ROUTE_TYPES,
    ViewType,
} from "../State"
import type { ActionChangeRouteArgs } from "./actions"



function parse_url_for_routing_params ({ url, routing_state }: { url: string, routing_state: RoutingState }): RoutingState
{
    const hash = url.split("#")[1] || ""

    const main_parts = hash.split("&")
    const path = main_parts[0]
    const new_args = main_parts.slice(1)

    const path_parts = path.split("/").filter(p => !!p)
    const route = path_parts[0] as ROUTE_TYPES

    if (!ALLOWED_ROUTES.includes(route))
    {
        return { route: "statements", sub_route: null, item_id: null, args: routing_state.args }
    }

    const part2 = (path_parts.slice(1).join("/") || null) as SUB_ROUTE_TYPES
    let sub_route: SUB_ROUTE_TYPES = null
    let item_id: string | null = null

    if (ALLOWED_SUB_ROUTES[route].includes(part2 as any)) sub_route = part2
    else item_id = part2 as string

    const args: RoutingArgs = {
        ...routing_state.args,
    }

    if (new_args.length)
    {
        new_args.forEach(part => {
            const [key, value] = part.split("=")
            if (value === "") return
            if (!is_route_arg_key(key)) return
            const valid_value = valid_route_arg_value(key, value)
            if (valid_value === undefined) return
            ;(args as any)[key] = valid_value
        })
    }

    return { route, sub_route, item_id, args }
}



function valid_route_arg_value (key: string, value: string)
{
    if (key === "view") return routing_view_types.includes(value) ? value : undefined
    if (key === "order") return routing_order_types.includes(value) ? value : undefined
    if (["x", "y", "zoom"].includes(key)) return parseInt(value)

    return value
}



export function routing_state_to_string (args: RoutingState): string
{
    const sub_route = args.sub_route ? `${args.sub_route}/` : ""
    const element_route = args.item_id ? `${args.item_id}/` : ""

    const routing_args = args.args || {}
    const routing_args_str = routing_args_to_string(routing_args)
    return "#" + args.route + "/" + sub_route + element_route + routing_args_str
}



const exclude_routiing_keys = new Set<RoutingArgKey>(["order", "rotation"])
export function routing_args_to_string (routing_args: RoutingArgs)
{
    const routing_args_str = Object.keys(routing_args)
        .filter(k => !exclude_routiing_keys.has(k as any))
        .sort()
        .reverse() // used so we can see x, y, zoom more easily
        .map(key => `&${key}=${routing_args[key as RoutingArgKey]}`)
        .join("")

    return routing_args_str
}


export function get_current_route_params (routing_state: RoutingState): RoutingState
{
    const url = window.location.toString()
    const routing_params = parse_url_for_routing_params({ url, routing_state })
    return routing_params
}


//

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
        const value = new_args[key as RoutingArgKey]
        const no_value = value === undefined || value === ""
        const not_valid = !is_route_arg_key(key)
        if (no_value || not_valid) delete new_args[key as RoutingArgKey]
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
    console.log("running tests of merge_routing_state")

    const current_routing_state = {
        route: "wcomponents" as ROUTE_TYPES,
        sub_route: null as SUB_ROUTE_TYPES,
        item_id: "wc53611570523449304",
        args:
        {
            cdate: "2021-04-09",
            ctime: "23:25:26",
            view: "knowledge" as ViewType,
            subview_id: "kv7207606403961189",
            zoom: 100,
            x: 0,
            y: 0,
            order: "normal" as OrderType,
            rotation: "0"
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

// run_tests()
