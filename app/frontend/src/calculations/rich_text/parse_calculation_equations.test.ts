import { test } from "../../shared/utils/test"
import { FullCalculationObject, ParsedCalculationObject } from "../interfaces"
import { parse_calculation_equations } from "./parse_calculation_equations"



export function run_parse_calculation_equations_tests ()
{
    console. group("running tests of parse_calculation_equations")

    const skip = true
    if (skip)
    {
        console. log("Skipping tests of parse_calculation_equations")
        console. groupEnd()
        return
    }


    let input_calculation_objects: FullCalculationObject[] = []
    let output_calculation_objects: ParsedCalculationObject[] = []
    let expected_calculation_objects: ParsedCalculationObject[] = []


    input_calculation_objects = [
        { valid: true, value: 123, value_str: "123", name: "" }
    ]
    expected_calculation_objects = [
        { valid: true, value: 123, value_str: "123", name: "", needs_computing: false }
    ]
    output_calculation_objects = parse_calculation_equations(input_calculation_objects)
    test(output_calculation_objects, expected_calculation_objects, "Should determine it does not need computing")


    input_calculation_objects = [
        { valid: true, value: Number.NaN, value_str: "A * B", name: "" }
    ]
    expected_calculation_objects = [
        { valid: true, value: Number.NaN, value_str: "A * B", name: "", needs_computing: true }
    ]
    output_calculation_objects = parse_calculation_equations(input_calculation_objects)
    test(output_calculation_objects, expected_calculation_objects, "Should mark value as needs computing")

    console. groupEnd()
}


// run_parse_calculation_equations_tests()
