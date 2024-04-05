import { describe, test } from "../../shared/utils/test"
import { make_calculation_safe_for_rich_text } from "./make_calculation_safe_for_rich_text"



export const run_make_calculation_safe_for_rich_text_tests = describe.delay("make_calculation_safe_for_rich_text", () =>
{
    let calculation: string
    let result_safe_rich_text: string
    let expected_safe_rich_text: string

    calculation = "A * B * C"
    expected_safe_rich_text = "A \\* B \\* C"
    result_safe_rich_text = make_calculation_safe_for_rich_text(calculation)
    test(result_safe_rich_text, expected_safe_rich_text, "Should escape *")

})
