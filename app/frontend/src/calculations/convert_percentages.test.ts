import { describe, test } from "../shared/utils/test"
import { convert_percentages } from "./convert_percentages"


// This functionality definitely belongs inside the Simulation.js package
// https://github.com/AJamesPhillips/DataCurator/issues/239
export const run_convert_percentages_tests = describe.delay("convert_percentages", () =>
{
    let calculation_string = ""
    let expected_converted_calculation = ""
    let result_calculation_string = ""

    calculation_string = `90 %`
    expected_converted_calculation = `(90 * 0.01)`
    result_calculation_string = convert_percentages(calculation_string)
    test(result_calculation_string, expected_converted_calculation, "Convert percentage symbol to numbers")

    calculation_string = `90 % / 10%`
    expected_converted_calculation = `(90 * 0.01) / (10 * 0.01)`
    result_calculation_string = convert_percentages(calculation_string)
    test(result_calculation_string, expected_converted_calculation, "Convert percentage symbols without spaces to numbers")

    calculation_string = `90.123 %`
    expected_converted_calculation = `(90.123 * 0.01)`
    result_calculation_string = convert_percentages(calculation_string)
    test(result_calculation_string, expected_converted_calculation, "Convert percentage symbols with decimal places")

    calculation_string = `.123 %`
    expected_converted_calculation = `(.123 * 0.01)`
    result_calculation_string = convert_percentages(calculation_string)
    test(result_calculation_string, expected_converted_calculation, "Convert percentage symbols with decimal point and no leading digit")

    calculation_string = `90.123 % - -90.123 %`
    // expected_converted_calculation = `(+90.123 * 0.01) - (-90.123 * 0.01)`
    expected_converted_calculation = `(90.123 * 0.01) - -(90.123 * 0.01)`
    result_calculation_string = convert_percentages(calculation_string)
    test(result_calculation_string, expected_converted_calculation, "Convert negative or positive percentage symbols")

    calculation_string = `9.1e+1 % - 9.1e-1 %`
    expected_converted_calculation = `(9.1e+1 * 0.01) - (9.1e-1 * 0.01)`
    result_calculation_string = convert_percentages(calculation_string)
    test(result_calculation_string, expected_converted_calculation, "Convert scientific notation percentage symbols")

    // calculation_string = `9.1 * 10 ^ 1 % - 9.1 * 10 ^ -1 %`
    // expected_converted_calculation = `(9.1e+1 * 0.01) - (9.1e-1 * 0.01)`
    // result_calculation_string = convert_percentages(calculation_string)
    // test(result_calculation_string, expected_converted_calculation, "Convert numbers raised to a power percentage symbols")

})
