import { describe, test } from "../shared/utils/test"
import { uuid_v4_for_tests } from "../utils/uuid_v4_for_tests"
import { convert_equation } from "./convert_equation"


export const run_convert_equation_tests = describe("convert_equation", () =>
{
    const id1 = uuid_v4_for_tests(1)
    let calculation_string = `[A] + 3`
    let expected_converted_calculation = `[A] + 3`
    let result_calculation_string = convert_equation(calculation_string)
    test(result_calculation_string, expected_converted_calculation, "Original square bracket IDs ignored")

    calculation_string = `[A] + B`
    expected_converted_calculation = `[A] + [B]`
    result_calculation_string = convert_equation(calculation_string)
    test(result_calculation_string, expected_converted_calculation, "Non square bracket id put into square brackets")

    calculation_string = `A + [B]`
    expected_converted_calculation = `[A] + [B]`
    result_calculation_string = convert_equation(calculation_string)
    test(result_calculation_string, expected_converted_calculation, "Beginning with non square bracket id put into square brackets")

    calculation_string = `A-B`
    expected_converted_calculation = `[A]-[B]`
    result_calculation_string = convert_equation(calculation_string)
    test(result_calculation_string, expected_converted_calculation, "Non square bracket ids with no spaces and a negation sign between are put into square brackets")

    calculation_string = `[A] + @@${id1}`
    expected_converted_calculation = `[A] + [${id1}]`
    result_calculation_string = convert_equation(calculation_string)
    test(result_calculation_string, expected_converted_calculation, "@@ uuid id put into square brackets")

    calculation_string = `B + B`
    expected_converted_calculation = `[B] + [B]`
    result_calculation_string = convert_equation(calculation_string)
    test(result_calculation_string, expected_converted_calculation, "Repeated non square bracket id dealt with correctly")

    calculation_string = `sin(1) + B`
    expected_converted_calculation = `sin(1) + [B]`
    result_calculation_string = convert_equation(calculation_string)
    test(result_calculation_string, expected_converted_calculation, "Simulation.js functions not processed into square brackets")

    calculation_string = `A>B`
    expected_converted_calculation = `[A]>[B]`
    result_calculation_string = convert_equation(calculation_string)
    test(result_calculation_string, expected_converted_calculation, "Simulation.js equality signs not processed into square brackets")

}, false)
