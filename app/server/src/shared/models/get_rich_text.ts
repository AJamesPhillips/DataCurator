import type { WComponent, WComponentsById } from "./SpecialisedObjects"
import { test } from "../utils/test"
import { get_wcomponent_state_value } from "./get_wcomponent_state_value"



export function get_title (args: GetRichTextArgs): string
{
    return get_rich_text(args, wc => wc.title)
}

export function get_description (args: GetRichTextArgs): string
{
    return get_rich_text(args, wc => wc.description)
}


export interface GetRichTextArgs
{
    wcomponent: WComponent
    rich_text: boolean
    wcomponents_by_id: WComponentsById
    ttl?: number
    root_url?: string
}
type Accessor = (wcomponent: WComponent) => string
function get_rich_text (args: GetRichTextArgs, accessor: Accessor = wc => wc.title): string
{
    const { wcomponent, rich_text, wcomponents_by_id, ttl = 3, root_url = "" } = args

    const field_value = accessor(wcomponent)

    if (!rich_text) return field_value

    const value = get_wcomponent_state_value(wcomponent)
    const value_replaced_text = field_value.replace("${value}", `${value}`)
    const replaced_text = replace_ids_in_text(value_replaced_text, wcomponents_by_id, ttl, root_url)

    return replaced_text
}



function replace_ids_in_text (text: string, wcomponents_by_id: WComponentsById, ttl: number, root_url: string)
{
    const ids = get_ids_from_text(text)
    ids.forEach(id =>
    {
        const replacer = new RegExp(`@@${id}`, "g")

        const wcomponent = wcomponents_by_id[id]
        if (!wcomponent)
        {
            text = text.replace(replacer, `\u2717@@` + id)
            return
        }

        const sub_text = ttl > 0
            ? get_rich_text({ wcomponent, rich_text: true, wcomponents_by_id, ttl: ttl - 1 })
            : "@@" + id
        // \uD83D\uDD17 is the link character
        text = text.replace(replacer, `[\u25A1](${root_url}#wcomponents/${id}&view=knowledge) ` + sub_text)
    })

    return text
}


function get_ids_from_text (text: string): string[]
{
    return [...text.matchAll(/.*?(@@\w*\d+)/g)].map(entry => entry[1].slice(2))
}



function run_tests ()
{
    let ids = get_ids_from_text("asd @@wc123 asd name@example.com #label dfg @@345 sf")
    test(ids, ["wc123", "345"])

    ids = get_ids_from_text("")
    test(ids, [])
}

// run_tests()
