import { test } from "../../../shared/utils/test"
import { uuid_v4_for_tests } from "../../../utils/uuid_v4_for_tests"
import { get_calculation_strs_from_text } from "./get_calculation_strs_from_text"
import { get_plain_calculation_object_from_str } from "./get_plain_calculation_object_from_str"
import { PlainCalculationObject } from "./interfaces"



export function get_calculations_from_text (text: string): PlainCalculationObject[]
{
    const calculation_strs = get_calculation_strs_from_text(text)

    const plain_calculation_objects = calculation_strs.map(get_plain_calculation_object_from_str)
    if (plain_calculation_objects.length)
    {
        console.log("plain_calculation_objects....", plain_calculation_objects)
    }

    // const calculation_object = plain_calculation_objects.map(get_)

    return plain_calculation_objects
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

// run_tests()
