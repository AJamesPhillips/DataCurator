import { get_double_at_mentioned_uuids_from_text } from "./id_regexs"
import type { ReplaceNormalIdsInTextArgs } from "./interfaces"
import { format_wcomponent_id_error, format_wcomponent_link } from "./templates"



export function replace_normal_ids (text: string, current_depth: number, args: ReplaceNormalIdsInTextArgs)
{
    const { root_url, depth_limit, get_title, render_links } = args

    const ids = get_double_at_mentioned_uuids_from_text(text)
    ids.forEach(id =>
    {
        const replacer = new RegExp(`@@${id}`, "g")

        const referenced_wcomponent = args.wcomponents_by_id[id]
        if (!referenced_wcomponent)
        {
            const missing_component_text = render_links ? format_wcomponent_link(root_url, id, `@@${id}`) : `@@${id}`

            text = text.replace(replacer, format_wcomponent_id_error(missing_component_text, "not found"))
            return
        }


        const replacement_content = current_depth < depth_limit
            ? get_title(referenced_wcomponent)
            // Return id for ids which are too deep
            : `@@${id}`

        const replacement_text = render_links ? format_wcomponent_link(root_url, id, replacement_content) : replacement_content

        text = text.replace(replacer, replacement_text)
    })

    return text
}
