import { test } from "../../../shared/utils/test"


interface ValidCalculationObject
{
    valid: true
    value: string
}

interface InvalidCalculationObject
{
    valid: false
    errors: string[]
}


type CalculationObject = ValidCalculationObject | InvalidCalculationObject


const CalculationObjectError = {
    empty_calculation: "Empty calculation object",
}


export function get_calculation_object_from_str (calculation_str: string): CalculationObject
{
    calculation_str = calculation_str.trim()

    if (!calculation_str) return { valid: false, errors: [CalculationObjectError.empty_calculation] }


    return { valid: true, value: "" }
}



function test_get_calculation_object_from_str ()
{
    console. log("running tests of get_calculation_object_from_str")

    let calculation_object = get_calculation_object_from_str("  ")
    test(calculation_object, { valid: false, errors: ["Empty calculation object"] }, "Should find an invalid calculation object when empty string")

}



function run_tests ()
{
    test_get_calculation_object_from_str()
}

run_tests()
