import { test_get_plain_calculation_object_from_str } from "./sharedf/rich_text/calculations/get_plain_calculation_object_from_str"
import { run_replace_calculations_with_results_tests } from "./sharedf/rich_text/calculations/replace_calculations_with_results.test"
import { run_get_rich_text_tests } from "./sharedf/rich_text/get_rich_text.test"
import { run_replace_normal_ids_tests } from "./sharedf/rich_text/replace_normal_ids.test"



function run_all_tests ()
{
    run_get_rich_text_tests()
    run_replace_calculations_with_results_tests()
    run_replace_normal_ids_tests()
    test_get_plain_calculation_object_from_str()
}


export function setup_tests_for_browser ()
{
    (window as any).run_tests = run_all_tests
}
