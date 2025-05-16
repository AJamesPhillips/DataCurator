import { describe, test } from "datacurator-core/utils/test"
import { date2str } from "../../shared/utils/date_helpers"
import { routing_arg_datetime_strings_to_datetime } from "./datetime/routing_datetime"
import {
    ALLOWED_ROUTE_ARGS,
    ALLOWED_ROUTE_ARGS_COUNT,
    ALLOWED_ROUTES,
    ALLOWED_SUB_ROUTES,
    is_routing_view_types,
    ROUTE_TYPES,
    RoutingState,
    RoutingStateArgs,
    RoutingStringArgKey,
    SUB_ROUTE_TYPES,
} from "./interfaces"



export function routing_state_to_string (args: RoutingState): string
{
    const sub_route = args.sub_route ? `${args.sub_route}/` : ""
    const element_route = args.item_id ? `${args.item_id}/` : ""

    const routing_args = args.args
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
        // .reverse() // used so we can see x, y, zoom more easily
        // Put cdate and ctime at the end so they are easiest to manually remove from url
        .concat(["sdate", "stime", "cdate", "ctime"])
        .map(key => `&${key}=${data[key] ?? ""}`)
        .join("")

    return routing_args_str
}



export function url_is_incomplete (url: string)
{
    const result = parse_url(url)

    return !result.route || result.args_from_url.length !== ALLOWED_ROUTE_ARGS_COUNT
}


function parse_url (url: string)
{
    const hash = url.split("#")[1] || ""

    const main_parts = hash.split("&")

    const path = main_parts[0]!
    const path_parts = path.split("/").filter(p => !!p)
    const { route, sub_route, item_id } = get_route_subroute_and_item_id(path_parts)

    const args_from_url = main_parts.slice(1)
        .map(part => part.split("=") as [RoutingStringArgKey, string])
        .filter(p => ALLOWED_ROUTE_ARGS[p[0]])

    return { route, sub_route, item_id, args_from_url }
}



export function merge_route_params_prioritising_url_over_state (url: string, routing_state: RoutingState): RoutingState
{
    const { route, sub_route, item_id, args_from_url } = parse_url(url)
    const args = update_args_from_url(routing_state.args, args_from_url)

    return { route, sub_route, item_id, args }
}



function get_route_subroute_and_item_id (path_parts: string[])
{
    let route = path_parts[0] as ROUTE_TYPES
    let sub_route: SUB_ROUTE_TYPES = null
    let item_id: string | null = null

    if (!ALLOWED_ROUTES.includes(route))
    {
        route = "wcomponents"
    }
    else
    {
        const part2 = (path_parts.slice(1).join("/") || null) as SUB_ROUTE_TYPES

        if (ALLOWED_SUB_ROUTES[route].includes(part2 as any)) sub_route = part2
        else item_id = part2 as string
    }

    return { route, sub_route, item_id }
}



function update_args_from_url (args: RoutingStateArgs, args_from_url: [RoutingStringArgKey, string][]): RoutingStateArgs
{
    args = { ...args }

    let cdate: string | null = null
    let ctime: string | null = null
    let sdate: string | null = null
    let stime: string | null = null

    args_from_url.forEach(part => {
        const [key, value] = part

        if (key === "cdate") cdate = value
        else if (key === "ctime") ctime = value
        else if (key === "sdate") sdate = value
        else if (key === "stime") stime = value
        else update_args_with_value(args, key, value)
    })

    args.created_at_datetime = routing_arg_datetime_strings_to_datetime(cdate, ctime)
    args.sim_datetime = sdate ? routing_arg_datetime_strings_to_datetime(sdate, stime) : args.created_at_datetime
    args.created_at_ms = args.created_at_datetime.getTime()
    args.sim_ms = args.sim_datetime.getTime()

    return args
}

function update_args_with_value (args: RoutingStateArgs, key: RoutingStringArgKey, value: string)
{
    if (key === "view")
    {
        if (is_routing_view_types(value)) args.view = value
    }
    else if (routing_arg_is_a_number(key)) args[key] = parse_int_or_0(value)
    else if (key === "subview_id") args.subview_id = value
    else if (key === "storage_location") args.storage_location = parse_int_or_undefined(value)
}



const ROUTING_ARGS_WHICH_ARE_NUMBERS = new Set(["x", "y", "zoom"])
function routing_arg_is_a_number (key: string): key is "x" | "y" | "zoom"
{
    return ROUTING_ARGS_WHICH_ARE_NUMBERS.has(key)
}


function parse_int_or_0 (val: string): number
{
    const int = parseInt(val)
    return Number.isNaN(int) ? 0 : int
}


function parse_int_or_undefined (val: string): number | undefined
{
    const int = parseInt(val)
    return Number.isNaN(int) ? undefined : int
}



export const test_routing_state_to_string = describe.delay("routing_state_to_string", () =>
{
    let state: RoutingState
    let result: string

    state = {
        route: "wcomponents",
        sub_route: null,
        item_id: "wc88",
        args: {
            view: "knowledge",
            subview_id: "kv77",
            zoom: 100,
            x: 101,
            y: 158,
            storage_location: undefined,
            created_at_datetime: new Date("2020-10-21T17:04:24.000Z"),
            created_at_ms: 1603299864000,
            sim_datetime: new Date("2021-04-26T09:23:13.000Z"),
            sim_ms: 1619428993000
        }
    }
    result = routing_state_to_string(state)
    test(result, "#wcomponents/wc88/&storage_location=&subview_id=kv77&view=knowledge&x=101&y=158&zoom=100&sdate=2021-04-26&stime=10:23:13&cdate=2020-10-21&ctime=18:04:24")

})
