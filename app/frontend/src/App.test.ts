import { run_add_newlines_to_markdown_tests } from "./sharedf/rich_text/add_newlines_to_markdown"
import { run_get_plain_calculation_object_from_str_tests } from "./calculations/rich_text/get_plain_calculation_object_from_str"
import { run_parse_calculation_equations_tests } from "./calculations/rich_text/parse_calculation_equations.test"
import { run_replace_calculations_with_results_tests } from "./calculations/rich_text/replace_calculations_with_results.test"
import { run_get_rich_text_tests } from "./sharedf/rich_text/get_rich_text.test"
import { run_replace_normal_ids_tests } from "./sharedf/rich_text/replace_normal_ids.test"
import { run_perform_calculations_test } from "./calculations/perform_calculations.test"



function run_all_tests ()
{
    run_get_rich_text_tests()
    run_replace_calculations_with_results_tests()
    run_replace_normal_ids_tests()
    run_get_plain_calculation_object_from_str_tests()
    run_add_newlines_to_markdown_tests()
    run_parse_calculation_equations_tests()
    run_perform_calculations_test()
}


export function setup_tests_for_browser ()
{
    (window as any).run_tests = run_all_tests
}
