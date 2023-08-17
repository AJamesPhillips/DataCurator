import { test_get_calculations_from_text } from "./sharedf/rich_text/calculations/get_calculations_from_text"
import { run_replace_calculations_with_results_tests } from "./sharedf/rich_text/calculations/replace_calculations_with_results.test"
import { run_get_rich_text_tests } from "./sharedf/rich_text/get_rich_text.test"
import { run_replace_normal_ids_tests } from "./sharedf/rich_text/replace_normal_ids.test"



function run_all_tests ()
{
    run_get_rich_text_tests()
    run_replace_calculations_with_results_tests()
    test_get_calculations_from_text()
    run_replace_normal_ids_tests()
}


export function setup_tests_for_browser ()
{
    (window as any).run_tests = run_all_tests
}
