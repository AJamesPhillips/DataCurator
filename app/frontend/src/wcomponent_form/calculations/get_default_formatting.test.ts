import { NUMBER_DISPLAY_TYPES, NumberDisplayType } from "../../shared/types"
import { describe, test } from "../../shared/utils/test"
import { get_default_result_display_type, get_default_significant_figures } from "./get_default_formatting"



export const run_get_default_formatting_function_tests = describe("get default formatting function", () =>
{
    const test_case: {
        calc_value: string,
        expected_sig_figs: number,
        test_description__sig_figs: string,
        expected_result_display_type: NumberDisplayType,
        test_description__result_display_type: string,
    }[] =
    [
        {
            calc_value: "  81.2  ",
            expected_sig_figs: 2,
            test_description__sig_figs: "Only 2 sig figures when valid number with decimal space",
            expected_result_display_type: NUMBER_DISPLAY_TYPES.simple,
            test_description__result_display_type: "Should assign simple type when only valid number",
        },
        {
            calc_value: "  1899  ",
            expected_sig_figs: 2,
            test_description__sig_figs: "Only 2 sig figures when integer number (1899) outside of 1900-2200",
            expected_result_display_type: NUMBER_DISPLAY_TYPES.simple,
            test_description__result_display_type: "Should assign simple type when integer number (1899) outside of 1900-2200",
        },
        {
            calc_value: "  1900  ",
            expected_sig_figs: 4,
            test_description__sig_figs: "4 sig figures when integer number (1900) inside of 1900-2200",
            expected_result_display_type: NUMBER_DISPLAY_TYPES.bare,
            test_description__result_display_type: "Should assign simple type when integer number (1900) inside of 1900-2200",
        },
        {
            calc_value: "  2200  ",
            expected_sig_figs: 4,
            test_description__sig_figs: "4 sig figures when integer number (2200) inside of 1900-2200",
            expected_result_display_type: NUMBER_DISPLAY_TYPES.bare,
            test_description__result_display_type: "Should assign simple type when integer number (2200) inside of 1900-2200",
        },
        {
            calc_value: "  2201  ",
            expected_sig_figs: 2,
            test_description__sig_figs: "Only 2 sig figures when integer number (2201) outside of 1900-2200",
            expected_result_display_type: NUMBER_DISPLAY_TYPES.simple,
            test_description__result_display_type: "Should assign simple type when integer number (2201) outside of 1900-2200",
        },
        {
            calc_value: "  81.2 %  ",
            expected_sig_figs: 2,
            test_description__sig_figs: "Default 2 sig figures when number is percentage",
            expected_result_display_type: NUMBER_DISPLAY_TYPES.percentage,
            test_description__result_display_type: "Should assign percentage type when % included with valid number containing spaces and decimal",
        },
        {
            calc_value: "83%",
            expected_sig_figs: 2,
            test_description__sig_figs: "Default 2 sig figures when number is percentage",
            expected_result_display_type: NUMBER_DISPLAY_TYPES.percentage,
            test_description__result_display_type: "Should assign percentage type when % included with simple valid number without spaces or decimal",
        },
    ]

    describe("get_default_significant_figures", () =>
    {
        let result_sig_figs: number
        test_case.forEach(test_case =>
        {
            result_sig_figs = get_default_significant_figures(test_case.calc_value)
            test(result_sig_figs, test_case.expected_sig_figs, test_case.test_description__sig_figs)
        })
    })



    describe("get_default_result_display_type", () =>
    {
        let result__result_display_type: NumberDisplayType
        test_case.forEach(test_case =>
        {
            result__result_display_type = get_default_result_display_type(test_case.calc_value)
            test(result__result_display_type, test_case.expected_result_display_type, test_case.test_description__result_display_type)
        })
    })

})
