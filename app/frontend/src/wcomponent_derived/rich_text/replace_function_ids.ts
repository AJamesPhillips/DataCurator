import type { WComponent, WComponentsById } from "../../wcomponent/interfaces/SpecialisedObjects"
import { old_ids_and_functions_regex, uuids_and_functions_regex } from "./id_regexs"
import { format_wcomponent_url, format_wcomponent_link } from "./templates"



export function replace_function_ids_in_text (text: string, wcomponents_by_id: WComponentsById, depth_limit: number, current_depth: number, render_links: boolean, root_url: string, get_title: (wcomponent: WComponent) => string)
{
    const functional_ids = get_functional_ids_from_text(text)
    if (functional_ids.length === 0) return text


    functional_ids.forEach(({ id, funktion }) =>
    {
        const referenced_wcomponent = wcomponents_by_id[id]

        if (!is_supported_funktion(funktion)) return // let id be replaced in the normal way
        if (!referenced_wcomponent) return // let id be replaced in the normal way

        let replacement = ""

        if (funktion === "url") replacement = format_wcomponent_url(root_url, id)
        else
        {
            // Add link at start
            replacement = render_links ? format_wcomponent_link(root_url, id) : ""

            if (funktion === "title") replacement = get_title(referenced_wcomponent)
            else if (funktion === "description") replacement += referenced_wcomponent.description
        }

        const replacer = new RegExp(`@@${id}\.${funktion}`, "g")
        text = text.replace(replacer, replacement)
    })


    if (current_depth < depth_limit)
    {
        text = replace_function_ids_in_text(text, wcomponents_by_id, depth_limit, current_depth + 1, render_links, root_url, get_title)
    }


    return text
}



function get_functional_ids_from_text (text: string): { id: string, funktion: string }[]
{
    const matches = [
        ...text.matchAll(uuids_and_functions_regex),
        ...text.matchAll(old_ids_and_functions_regex),
    ]

    return matches.map(entry => ({ id: entry[1]!.slice(2), funktion: entry[2]! }))
}



type Funktion = "url" | "title" | "description"
const _supported_functions: {[f in Funktion]: true} = {
    url: true,
    title: true,
    description: true,
}
const supported_funktions = new Set(Object.keys(_supported_functions))

function is_supported_funktion (funktion: string): funktion is Funktion
{
    return supported_funktions.has(funktion)
}
