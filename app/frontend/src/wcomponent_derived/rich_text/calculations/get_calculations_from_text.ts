import { test } from "../../../shared/utils/test"
import { uuid_v4_for_tests } from "../../../utils/uuid_v4_for_tests"
import { get_calculation_strs_from_text } from "./get_calculation_strs_from_text"



export function get_calculations_from_text (text: string): string[]
{
    return get_calculation_strs_from_text(text)
}


function test_get_calculations_from_text ()
{
    console. log("running tests of get_calculations_from_text")

    const id1 = "@@" + uuid_v4_for_tests(1)


    // let calculations = get_calculations_from_text("")
    // test(calculations, [], "Should find no calculations when empty string")

}



function run_tests ()
{
    test_get_calculations_from_text()
}

run_tests()
