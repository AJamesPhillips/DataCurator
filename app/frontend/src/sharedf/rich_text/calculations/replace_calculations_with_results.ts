import { test } from "../../../shared/utils/test"
import { uuid_v4_for_tests } from "../../../utils/uuid_v4_for_tests"
import type { ReplaceNormalIdsInTextArgs } from "../interfaces"
import { get_calculations_from_text } from "./get_calculations_from_text"



export function replace_calculations_with_results (text: string, current_depth: number, args: ReplaceNormalIdsInTextArgs)
{
    const { root_url, depth_limit, get_title, render_links } = args

    const calculations = get_calculations_from_text(text)
    // if (calculations.length) console.log("calculations", calculations)

    calculations.forEach((calculation, i) =>
    {
        const replacer = new RegExp(`\\$\\$\\!.*?\\$\\$\\!`, "s")

        text = text.replace(replacer, `calculation ${i}`)

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




function run_replace_calculations_with_results_tests ()
{
    console. log("running tests of replace_calculations_with_results")

    const id1 = uuid_v4_for_tests(1)
    const args: ReplaceNormalIdsInTextArgs = {
        wcomponents_by_id: {},
        depth_limit: 2,
        render_links: true,
        root_url: "http://datacurator.org",
        get_title: () => "some title",
    }

    let input_text = `
$$!
value: "@@${id1}"
$$!
`
    let altered_text = replace_calculations_with_results(input_text, 1, args)
    test(altered_text, `[27 million UK Homes](/${id1})`, "Should replace calculations")
}


run_replace_calculations_with_results_tests()
