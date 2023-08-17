import { get_calculations_from_text } from "./get_calculations_from_text"
import { ReplaceCalculationsWithResults } from "./interfaces"



export function replace_calculations_with_results (text: string, args: ReplaceCalculationsWithResults)
{
    const calculations = get_calculations_from_text(text, args)
    // if (calculations.length) console.log("calculations", calculations)

    calculations.forEach((calculation, i) =>
    {
        const replacer = new RegExp(`\\$\\$\\!.*?\\$\\$\\!`, "s")

        text = text.replace(replacer, calculation)

        // const referenced_wcomponent = args.wcomponents_by_id[calculation]
        // if (!referenced_wcomponent)
        // {
        //     text = text.replace(replacer, format_wcomponent_id_error(root_url, calculation, "not found"))
        //     return
        // }


        // const replacement_content = current_depth < depth_limit
        //     ? get_title(referenced_wcomponent)
        //     // Return id for ids which are too deep
        //     : `@@${calculation}`

        // const replacement_text = render_links ? format_wcomponent_link(root_url, calculation, replacement_content) : replacement_content

        // text = text.replace(replacer, replacement_text)
    })

    return text
}
