import { describe, test } from "datacurator-core/utils/test"
import { uuid_v4_for_tests } from "../utils/uuid_v4_for_tests"
import { normalise_calculation_numbers } from "./normalise_calculation_numbers"



export const test_normalise_calculation_numbers = describe.delay("normalise_calculation_numbers", () =>
{
    const id1 = uuid_v4_for_tests(1)
    let calculation_string = ""
    let expected_converted_calculation = ""
    let result_calculation_string = ""

    calculation_string = `B + [A] @@${id1} + 3.1 + {4.2 km}`
    expected_converted_calculation = `B + [A] @@${id1} + 3.1 + {4.2 km}`
    result_calculation_string = normalise_calculation_numbers(calculation_string)
    test(result_calculation_string, expected_converted_calculation, "Non and square bracket IDs, @@uuids, decimal numbers, and curly bracket numbers with units are left unchanged")

    calculation_string = `3,200 + 1,800.0`
    expected_converted_calculation = `3200 + 1800.0`
    result_calculation_string = normalise_calculation_numbers(calculation_string)
    test(result_calculation_string, expected_converted_calculation, "Thousands commas are removed from numbers")

    calculation_string = `3,20 + 1,80.0`
    expected_converted_calculation = `3,20 + 1,80.0`
    result_calculation_string = normalise_calculation_numbers(calculation_string)
    test(result_calculation_string, expected_converted_calculation, "Non-thousands commas are ignored")

    calculation_string = `1,200,300 10,300,400 100,200,300`
    expected_converted_calculation = `1200300 10300400 100200300`
    result_calculation_string = normalise_calculation_numbers(calculation_string)
    test(result_calculation_string, expected_converted_calculation, "Thousands commas are removed from millions")

    calculation_string = `1,200,300,400 10,200,300,400 100,200,300,400`
    expected_converted_calculation = `1200300400 10200300400 100200300400`
    result_calculation_string = normalise_calculation_numbers(calculation_string)
    test(result_calculation_string, expected_converted_calculation, "Thousands commas are removed from billions")

})
