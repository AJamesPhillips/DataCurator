import {
    wcomponent_has_value_possibilities,
    wcomponent_is_counterfactual_v2,
    wcomponent_is_plain_connection,
    wcomponent_is_state_value,
    wcomponent_is_sub_state,
} from "../../wcomponent/interfaces/SpecialisedObjects"
import type { GetFieldTextArgs } from "./get_rich_text"



export function get_default_wcomponent_title (args: GetFieldTextArgs)
{
    let title = ""

    if (wcomponent_is_plain_connection(args.wcomponent))
    {
        const from_wc = args.wcomponents_by_id[args.wcomponent.from_id]
        const to_wc = args.wcomponents_by_id[args.wcomponent.to_id]

        if (from_wc || to_wc)
        {
            title = `${from_wc ? ("@@" + from_wc.id) : "_"} -> ${to_wc ? ("@@" + to_wc.id) : "_"} <auto generated>`
        }

        // const current_depth = (args.current_depth || 0) + 1
        // const from_title = from_wc ? get_title({ ...args, current_depth, wcomponent: from_wc }) : ""
        // const to_title = to_wc ? get_title({ ...args, current_depth, wcomponent: to_wc }) : ""

        // if (from_title || to_title)
        // {
        //     title = `${from_title || "_"} -> ${to_title || "_"} <auto generated>`
        // }
    }
    else if (wcomponent_is_counterfactual_v2(args.wcomponent))
    {
        title = `Counterfactual (no target set) <auto generated>`

        const target_wc_id = args.wcomponent.target_wcomponent_id
        if (target_wc_id) title = `Counterfactual of: @@${target_wc_id} <auto generated>`
    }
    else if (wcomponent_is_sub_state(args.wcomponent))
    {
        title = `Sub state (no target set) <auto generated>`

        const { target_wcomponent_id, selector } = args.wcomponent
        if (target_wcomponent_id)
        {
            title = `Sub state of @@${target_wcomponent_id}`

            if (selector?.target_value && selector?.target_value_id_type)
            {
                const { target_value, target_value_id_type } = selector
                let value_possibility_str = ""

                if (target_value_id_type === "id")
                {
                    const target_wc = args.wcomponents_by_id[target_wcomponent_id]
                    if (wcomponent_has_value_possibilities(target_wc))
                    {
                        const value_possibility = (target_wc?.value_possibilities || {})[target_value]
                        if (value_possibility) value_possibility_str = value_possibility.value
                    }
                }
                else value_possibility_str = target_value

                title += (": " + value_possibility_str)
            }

            title += ` <auto generated>`
        }
    }
    else if (wcomponent_is_state_value(args.wcomponent))
    {
        title = `State value (no target attribute set) <auto generated>`

        const { attribute_wcomponent_id } = args.wcomponent
        if (attribute_wcomponent_id)
        {
            title = attribute_wcomponent_id ? `Alternative state value for @@${attribute_wcomponent_id} ` : `No target attribute `

            title += `<auto generated>`
        }
    }

    return title
}
