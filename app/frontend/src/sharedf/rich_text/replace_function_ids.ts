import {
    old_ids_and_functions_regex,
    uuids_and_functions_regex,
} from "datacurator-core/utils/id_regexs"

import { get_wcomponent_state_UI_value } from "../../wcomponent_derived/get_wcomponent_state_UI_value"
import type { ReplaceFunctionIdsInTextArgs } from "./interfaces"
import { format_wcomponent_link, format_wcomponent_url } from "./templates"



export function replace_function_ids_in_text (text: string, current_depth: number, kwargs: ReplaceFunctionIdsInTextArgs)
{
    const { get_title, root_url, render_links, depth_limit } = kwargs

    // Protect against recursive functional ids
    if (current_depth >= depth_limit) return text


    const functional_ids = get_functional_ids_from_text(text)
    if (functional_ids.length === 0) return text


    functional_ids.forEach(({ id, funktion }) =>
    {
        const referenced_wcomponent = kwargs.wcomponents_by_id[id]

        if (!is_supported_funktion(funktion)) return // let id be replaced in the normal way

        let replacement = ""

        if (funktion === "map")
        {
            const referenced_knowledge_view = kwargs.knowledge_views_by_id[id]
            const title = referenced_knowledge_view?.title || id
            const wcomponent_id = referenced_wcomponent ? id : ""
            replacement = format_wcomponent_link(root_url, wcomponent_id, title, id)
        }

        else if (!referenced_wcomponent) return // let id be replaced in the normal way

        else if (funktion === "url") replacement = format_wcomponent_url(root_url, id)
        else if (funktion === "value")
        {
            const created_at_ms = new Date().getTime()
            const value = get_wcomponent_state_UI_value({
                wcomponent: referenced_wcomponent,
                VAP_set_id_to_counterfactual_v2_map: {},
                created_at_ms,
                sim_ms: created_at_ms,
            })

            replacement = value?.values_string || ""
        }
        else
        {
            // Add link at start
            replacement = render_links ? format_wcomponent_link(root_url, id) : ""

            if (funktion === "title") replacement = get_title(referenced_wcomponent)
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            else if (funktion === "description") replacement += referenced_wcomponent.description
        }

        const replacer = new RegExp(`@@${id}.${funktion}`, "g")
        text = text.replace(replacer, replacement)
    })


    if (current_depth < depth_limit)
    {
        text = replace_function_ids_in_text(text, current_depth + 1, kwargs)
    }


    return text
}



function get_functional_ids_from_text (text: string): { id: string, funktion: /*Funktion |*/ string }[]
{
    const matches = [
        ...text.matchAll(uuids_and_functions_regex),
        ...text.matchAll(old_ids_and_functions_regex),
    ]

    return matches.map(entry => ({ id: entry[1]!.slice(2), funktion: entry[2]! }))
}



type Funktion = "url" | "title" | "description" | "map" | "value"
const _supported_functions: {[f in Funktion]: true} = {
    url: true,
    title: true,
    description: true,
    map: true,
    value: true,
}
const supported_funktions = new Set(Object.keys(_supported_functions))

function is_supported_funktion (funktion: string): funktion is Funktion
{
    return supported_funktions.has(funktion)
}
