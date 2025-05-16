import { describe, test } from "datacurator-core/utils/test"
import { ParsedValue } from "../../wcomponent_derived/interfaces/value"
import { VAPsType } from "../interfaces/VAPsType"
import { is_string_valid_number, parse_VAP_value } from "./parse_value"



export const test_parse_value = describe.delay("parse_value", () =>
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

            parsed_VAP_value = helper_func__parse_VAP_value("")
            test(parsed_VAP_value, null, "Should parse empty string as valid but null")

            parsed_VAP_value = helper_func__parse_VAP_value("   ")
            test(parsed_VAP_value, null, "Should parse string of spaces as valid but null")

            parsed_VAP_value = helper_func__parse_VAP_value("123")
            test(parsed_VAP_value, 123, "Should parse valid number")

            parsed_VAP_value = helper_func__parse_VAP_value("  123  ")
            test(parsed_VAP_value, 123, "Should parse valid number with whitespace")

            parsed_VAP_value = helper_func__parse_VAP_value("123abc")
            test(Number.isNaN(parsed_VAP_value), true, "Should parse number with appended invalid characters as invalid NaN")

            parsed_VAP_value = helper_func__parse_VAP_value("abc123")
            test(Number.isNaN(parsed_VAP_value), true, "Should parse number with prepended invalid characters as invalid NaN")

            parsed_VAP_value = helper_func__parse_VAP_value("123%")
            test(parsed_VAP_value, 1.23, "Should parse number with appended %")

            parsed_VAP_value = helper_func__parse_VAP_value("123 %")
            test(parsed_VAP_value, 1.23, "Should parse number with appended whitespace %")

            parsed_VAP_value = helper_func__parse_VAP_value("123%%")
            test(Number.isNaN(parsed_VAP_value), true, "Should parse number with appended % and further invalid characters as invalid NaN")

            parsed_VAP_value = helper_func__parse_VAP_value("1e-3%")
            test(parsed_VAP_value, 0.00001, "Should parse negative exponent number with appended %")

            parsed_VAP_value = helper_func__parse_VAP_value(".3 e 2 %")
            test(parsed_VAP_value, 0.3, "Should parse fractional number with exponent with appended % and interspersed whitespace")

            parsed_VAP_value = helper_func__parse_VAP_value("3,000.200")
            test(parsed_VAP_value, 3000.2, "Should parse numbers with commas as thousands separators")

            parsed_VAP_value = helper_func__parse_VAP_value("3,000.200%")
            test(parsed_VAP_value, 30.002, "Should parse numbers with commas as thousands separators and percentage sign")
        })
    })

    describe("is_string_valid_number", () =>
    {
        test(is_string_valid_number(""), true, "empty string is valid number")
        test(is_string_valid_number("   "), true, "string of spaces is valid number")
        test(is_string_valid_number("123"), true, "valid number")
        test(is_string_valid_number("  123  "), true, "valid number with whitespace")
        test(is_string_valid_number("123abc"), false, "number with appended invalid characters")
        test(is_string_valid_number("abc123"), false, "number with prepended invalid characters")
        test(is_string_valid_number("123%"), true, "number with appended % (valid)")
        test(is_string_valid_number("a90%"), false, "number with appended % but prepended character (invalid)")
        test(is_string_valid_number("123 %"), true, "number with appended whitespace % (valid)")
        test(is_string_valid_number("123%%"), false, "number with appended % and further invalid characters")
        test(is_string_valid_number("1e-3%"), true, "negative exponent number with appended % (valid)")
        test(is_string_valid_number(".3 e 2 %"), true, "fractional number with exponent with appended % and interspersed whitespace (valid)")
        test(is_string_valid_number("3,000.200%"), true, "numbers with commas as thousands separators are allowed")
        test(is_string_valid_number("3,00.2"), false, "numbers with commas not at every 1000 are not allowed")
        test(is_string_valid_number("3,00"), false, "numbers with commas not at every 1000 are not allowed")
    })

})
