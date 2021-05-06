import { WComponent, WComponentsById, wcomponent_is_process } from "./interfaces/SpecialisedObjects"
import { test } from "../utils/test"
import { get_wcomponent_state_value } from "./get_wcomponent_state_value"
import type { WComponentCounterfactuals } from "../../state/derived/State"
import { get_new_wcomponent_object } from "../../knowledge/create_wcomponent_type"



export interface GetFieldTextArgs extends GetIdReplacedTextArgs
{
    wcomponent: WComponent
    counterfactuals: WComponentCounterfactuals | undefined
    created_at_ms: number
    sim_ms: number
}
export function get_title (args: GetFieldTextArgs): string
{
    const { wcomponent, counterfactuals, created_at_ms, sim_ms } = args
    const modified_title = get_type_specific_title(wcomponent)
    const text = replace_value_in_text({ text: modified_title, wcomponent, counterfactuals, created_at_ms, sim_ms })

    return replace_ids_in_text({ ...args, text })
}

export function get_description (args: GetFieldTextArgs): string
{
    const text = args.wcomponent.description

    return replace_ids_in_text({ ...args, text })
}



function get_type_specific_title (wcomponent: WComponent)
{
    let { title, type } = wcomponent

    if (type === "actor") title = "Actor: " + title
    else if (wcomponent_is_process(wcomponent) && wcomponent.is_action) title = "Action: " + title

    return title
}



interface ReplaceValueInTextArgs
{
    text: string
    wcomponent: WComponent
    counterfactuals: WComponentCounterfactuals | undefined
    created_at_ms: number
    sim_ms: number
}
export function replace_value_in_text (args: ReplaceValueInTextArgs)
{
    const value = get_wcomponent_state_value({
        wcomponent: args.wcomponent,
        counterfactuals: args.counterfactuals,
        created_at_ms: args.created_at_ms,
        sim_ms: args.sim_ms,
    }).value
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

    const replaced_text = _replace_ids_in_text(text, rich_text, wcomponents_by_id, depth_limit, root_url, true)

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


function _replace_ids_in_text (text: string, rich_text: boolean, wcomponents_by_id: WComponentsById, depth_limit: number, root_url: string, render_links: boolean)
{
    const functional_ids = rich_text ? get_functional_ids_from_text(text) : []
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
                replacement = render_links ? format_wcomponent_link(root_url, id) : ""
                replacement += wcomponent.description
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


        let replacement_text = (rich_text && render_links) ? (format_wcomponent_link(root_url, id) + " ") : ""

        const sub_text = depth_limit > 0 ? _replace_ids_in_text(
            wcomponent.title,
            rich_text,
            wcomponents_by_id,
            depth_limit - 1,
            root_url,
            false,
        ) : `@@${id}`

        replacement_text += sub_text


        text = text.replace(replacer, replacement_text)
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
    return [...text.matchAll(/.*?(@@\w*\d+)\.([\w]+)/g)].map(entry => ({ id: entry[1]!.slice(2), funktion: entry[2]! }))
}

function get_ids_from_text (text: string): string[]
{
    return [...text.matchAll(/.*?(@@\w*\d+)/g)].map(entry => entry[1]!.slice(2))
}



function run_tests ()
{
    console. log("running tests of get_ids_from_text")

    let ids = get_ids_from_text("asd @@wc123 asd name@example.com #label dfg @@345 sf")
    test(ids, ["wc123", "345"])

    ids = get_ids_from_text("")
    test(ids, [])


    const wcomponents_by_id = {
        "123": get_new_wcomponent_object({ id: "123", title: "Was told @@456 is here" }),
        "456": get_new_wcomponent_object({ id: "456", title: "Person A" }),
    }

    let result = replace_ids_in_text({
        rich_text: true,
        wcomponents_by_id,
        text: "Person B @@123 today"
    })
    test(result, "Person B [□](#wcomponents/123&view=knowledge) Was told Person A is here today")

    result = replace_ids_in_text({
        rich_text: false,
        wcomponents_by_id,
        text: "Person B @@123 today"
    })
    test(result, "Person B Was told Person A is here today")
}

run_tests()
