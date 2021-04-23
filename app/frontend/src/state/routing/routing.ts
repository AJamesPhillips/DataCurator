import { date2str } from "../../shared/utils/date_helpers"
import {
    RoutingState,
    ROUTE_TYPES,
    ALLOWED_ROUTES,
    SUB_ROUTE_TYPES,
    ALLOWED_SUB_ROUTES,
    RoutingStateArgs,
    is_routing_view_types,
    is_routing_order_types,
    is_route_string_arg_number,
    RoutingStringArgKey,
} from "./interfaces"
import { routing_arg_datetime_strings_to_datetime } from "./datetime/routing_datetime"



export function routing_state_to_string (args: RoutingState): string
{
    const sub_route = args.sub_route ? `${args.sub_route}/` : ""
    const element_route = args.item_id ? `${args.item_id}/` : ""

    const routing_args = args.args || {}
    const routing_args_str = routing_args_to_string(routing_args)
    return "#" + args.route + "/" + sub_route + element_route + routing_args_str
}



const exclude_routing_keys = new Set([
    "order", "rotation",
    "created_at_datetime", "created_at_ms", "sim_datetime", "sim_ms",
])
export function routing_args_to_string (routing_args: RoutingStateArgs)
{
    const data = {
        ...routing_args,
        cdate: date2str(routing_args.created_at_datetime, "yyyy-MM-dd"),
        ctime: date2str(routing_args.created_at_datetime, "hh:mm:ss"),
        sdate: date2str(routing_args.sim_datetime, "yyyy-MM-dd"),
        stime: date2str(routing_args.sim_datetime, "hh:mm:ss"),
    }

    const routing_args_str = (Object.keys(routing_args) as (keyof typeof data)[])
        .filter(k => !exclude_routing_keys.has(k))
        .sort()
        .reverse() // used so we can see x, y, zoom more easily
        // Put cdate and ctime at the end so they are easiest to manually remove from url
        .concat(["sdate", "stime", "cdate", "ctime"])
        .map(key => `&${key}=${data[key]}`)
        .join("")

    return routing_args_str
}



export function get_current_route_params (routing_state: RoutingState): RoutingState
{
    const url = window.location.toString()
    const new_routing_state = parse_url_for_state({ url, current_routing_state: routing_state })
    return new_routing_state
}



interface ParseUrlForStateArgs
{
    url: string
    current_routing_state: RoutingState
}
function parse_url_for_state ({ url, current_routing_state }: ParseUrlForStateArgs): RoutingState
{
    const hash = url.split("#")[1] || ""

    const main_parts = hash.split("&")

    const path = main_parts[0]
    const path_parts = path.split("/").filter(p => !!p)
    const { route, sub_route, item_id } = get_route_subroute_and_item_id(path_parts)

    const args_from_url = main_parts.slice(1)
    const args = update_args_from_url(current_routing_state.args, args_from_url)

    return { route, sub_route, item_id, args }
}



function get_route_subroute_and_item_id (path_parts: string[])
{
    let route = path_parts[0] as ROUTE_TYPES
    let sub_route: SUB_ROUTE_TYPES = null
    let item_id: string | null = null

    if (!ALLOWED_ROUTES.includes(route))
    {
        route = "statements"
    }
    else
    {
        const part2 = (path_parts.slice(1).join("/") || null) as SUB_ROUTE_TYPES

        if (ALLOWED_SUB_ROUTES[route].includes(part2 as any)) sub_route = part2
        else item_id = part2 as string
    }

    return { route, sub_route, item_id }
}



function update_args_from_url (args: RoutingStateArgs, args_from_url: string[]): RoutingStateArgs
{
    args = { ...args }

    let cdate: string | null = null
    let ctime: string | null = null
    let sdate: string | null = null
    let stime: string | null = null

    args_from_url.forEach(part => {
        const [key, value] = part.split("=") as [RoutingStringArgKey, string]
        update_args_with_value(key, value, args)

        if (key === "cdate") cdate = value
        else if (key === "ctime") ctime = value
        else if (key === "sdate") sdate = value
        else if (key === "stime") stime = value
    })

    args.created_at_datetime = routing_arg_datetime_strings_to_datetime(cdate, ctime)
    args.sim_datetime = sdate ? routing_arg_datetime_strings_to_datetime(sdate, stime) : args.created_at_datetime

    return args
}

function update_args_with_value (key: RoutingStringArgKey, value: string, args: RoutingStateArgs)
{
    if (key === "view")
    {
        if (is_routing_view_types(value)) args.view = value
    }
    else if (key === "subview_id") args.subview_id = value
    else if (key === "order")
    {
        if (is_routing_order_types(value)) args.order = value
    }
    else if (is_route_string_arg_number(key)) args[key] = parseInt(value)
}
