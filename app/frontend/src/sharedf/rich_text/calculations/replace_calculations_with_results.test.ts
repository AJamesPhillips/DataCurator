import { test } from "../../../shared/utils/test"
import { ReplaceNormalIdsInTextArgs } from "../interfaces"
import { replace_calculations_with_results } from "./replace_calculations_with_results"



export function run_replace_calculations_with_results_tests ()
{
    console. log("running tests of replace_calculations_with_results")


    const args: ReplaceNormalIdsInTextArgs = {
        wcomponents_by_id: {},
        depth_limit: 2,
        render_links: true,
        root_url: "http://datacurator.org",
        get_title: () => "some title",
    }


    let input_text = `
$$!
value: 123
$$!
`
    let altered_text = replace_calculations_with_results(input_text, 1, args)
    test(altered_text, `\n123\n`, "Should replace $$! and content between with calculation text")

}


run_replace_calculations_with_results_tests()
