import { run_get_rich_text_tests } from "./sharedf/rich_text/get_rich_text.test"



function run_tests ()
{
    run_get_rich_text_tests()
}


export function setup_tests_for_browser ()
{
    (window as any).run_tests = run_tests
}
