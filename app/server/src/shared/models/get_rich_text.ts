import type { WComponent, WComponentsById } from "./interfaces/SpecialisedObjects"
import { test } from "../utils/test"
import { get_wcomponent_state_value } from "./get_wcomponent_state_value"



export interface GetFieldTextArgs extends GetIdReplacedTextArgs
{
    wcomponent: WComponent
    created_at_ms: number
    sim_ms: number
}
export function get_title (args: GetFieldTextArgs): string
{
    const { wcomponent, created_at_ms, sim_ms } = args
    const title = wcomponent.title
    const text = replace_value_in_text({ text: title, wcomponent, created_at_ms, sim_ms })

    return replace_ids_in_text({ ...args, text })
}

export function get_description (args: GetFieldTextArgs): string
{
    const text = args.wcomponent.description

    return replace_ids_in_text({ ...args, text })
}



interface ReplaceValueInTextArgs
{
    text: string
    wcomponent: WComponent
    created_at_ms: number
    sim_ms: number
}
export function replace_value_in_text (args: ReplaceValueInTextArgs)
{
    const value = get_wcomponent_state_value(args.wcomponent, args.created_at_ms, args.sim_ms).value
    const text = args.text.replace(/\$\{value\}/g, `${value}`)
    return text
}



interface GetIdReplacedTextArgs
{
    rich_text: boolean
    wcomponents_by_id: WComponentsById
    depth_limit?: number
    root_url?: string
}
export function replace_ids_in_text (args: GetIdReplacedTextArgs & { text: string }): string
{
    const { text, rich_text, wcomponents_by_id, depth_limit = 3, root_url = "" } = args

    if (!rich_text) return text

    const replaced_text = _replace_ids_in_text(text, wcomponents_by_id, depth_limit, root_url)

    return replaced_text
}



type Funktion = "url" | "description"
const _supported_functions: {[f in Funktion]: true} = {
    url: true,
    description: true,
}
const supported_funktions = new Set(Object.keys(_supported_functions))

function is_supported_funktion (funktion: string): funktion is Funktion
{
    return supported_funktions.has(funktion)
}


function _replace_ids_in_text (text: string, wcomponents_by_id: WComponentsById, depth_limit: number, root_url: string)
{
    const functional_ids = get_functional_ids_from_text(text)
    functional_ids.forEach(({ id, funktion }) =>
        {
            const wcomponent = wcomponents_by_id[id]

            if (!is_supported_funktion(funktion)) return // let id be replaced in the normal way
            if (!wcomponent) return // let id be replaced in the normal way

            let replacement = ""

            if (funktion === "url") replacement = format_wcomponent_url(root_url, id)
            else if (funktion === "description")
            {
                // Add link at start
                replacement = format_wcomponent_link(root_url, id) + wcomponent.description
            }
            else replacement =`Function ${funktion} not implemented`

            const replacer = new RegExp(`@@${id}\.${funktion}`, "g")
            text = text.replace(replacer, replacement)
        })

    const ids = get_ids_from_text(text)
    ids.forEach(id =>
    {
        const replacer = new RegExp(`@@${id}`, "g")

        const wcomponent = wcomponents_by_id[id]
        if (!wcomponent)
        {
            text = text.replace(replacer, format_wcomponent_id_error("not found", id))
            return
        }

        const sub_text = depth_limit > 0 ? replace_ids_in_text(
            {
                text: wcomponent.title,
                rich_text: true,
                wcomponents_by_id,
                depth_limit: depth_limit - 1,
            }) : `@@${id}`

        text = text.replace(replacer, format_wcomponent_link(root_url, id) + " " + sub_text)
    })

    return text
}


// \u2717 --> ✗
const format_wcomponent_id_error = (error: string, str: string) => `\u2717@@${str} (${error})`
export const format_wcomponent_url = (root_url: string, id: string) => `${root_url}#wcomponents/${id}&view=knowledge`
// \uD83D\uDD17 --> 🔗 aka the very ugly link (chain) character
// \u25A1 --> □
const format_wcomponent_link = (root_url: string, id: string) => `[\u25A1](${format_wcomponent_url(root_url, id)})`


function get_functional_ids_from_text (text: string): { id: string, funktion: string }[]
{
    return [...text.matchAll(/.*?(@@\w*\d+)\.([\w]+)/g)].map(entry => ({ id: entry[1].slice(2), funktion: entry[2] }))
}

function get_ids_from_text (text: string): string[]
{
    return [...text.matchAll(/.*?(@@\w*\d+)/g)].map(entry => entry[1].slice(2))
}



function run_tests ()
{
    console. log("running tests of get_ids_from_text")

    let ids = get_ids_from_text("asd @@wc123 asd name@example.com #label dfg @@345 sf")
    test(ids, ["wc123", "345"])

    ids = get_ids_from_text("")
    test(ids, [])
}

// run_tests()
