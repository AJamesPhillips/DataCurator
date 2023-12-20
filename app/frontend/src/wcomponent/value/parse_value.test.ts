import { describe, test } from "../../shared/utils/test"
import { ParsedValue } from "../../wcomponent_derived/interfaces/value"
import { VAPsType } from "../interfaces/VAPsType"
import { parse_VAP_value } from "./parse_value"



export const run_parse_value_tests = describe("parse_value", () =>
{

    describe("parse_VAP_value", () =>
    {
        let parsed_VAP_value: ParsedValue

        describe("VAPsType \"number\"", () =>
        {
            const helper_func__parse_VAP_value = (value: string) =>
            {
                return parse_VAP_value({value, id: "", description: "", explanation: "", probability: 1, conviction: 1}, VAPsType.number)
            }

            parsed_VAP_value = helper_func__parse_VAP_value("123")
            test(parsed_VAP_value, 123, "Should parse valid number")

            parsed_VAP_value = helper_func__parse_VAP_value("  123  ")
            test(parsed_VAP_value, 123, "Should parse valid number with whitespace")

            parsed_VAP_value = helper_func__parse_VAP_value("123abc")
            test(Number.isNaN(parsed_VAP_value), true, "Should not parse number with prepended invalid characters")

            parsed_VAP_value = helper_func__parse_VAP_value("abc123")
            test(Number.isNaN(parsed_VAP_value), true, "Should not parse number with appended invalid characters")

            parsed_VAP_value = helper_func__parse_VAP_value("123%")
            test(parsed_VAP_value, 1.23, "Should parse number with prepended %")

            parsed_VAP_value = helper_func__parse_VAP_value("123 %")
            test(parsed_VAP_value, 1.23, "Should parse number with prepended whitespace %")

            parsed_VAP_value = helper_func__parse_VAP_value("123%%")
            test(Number.isNaN(parsed_VAP_value), true, "Should not parse number with appended % and further invalid characters")

            parsed_VAP_value = helper_func__parse_VAP_value("1e-3%")
            test(parsed_VAP_value, 0.00001, "Should parse exponent number with appended %")

            parsed_VAP_value = helper_func__parse_VAP_value(".3 e 2 %")
            test(parsed_VAP_value, 0.3, "Should parse fractional number with exponent with appended %")
        })
    })

}, false)
