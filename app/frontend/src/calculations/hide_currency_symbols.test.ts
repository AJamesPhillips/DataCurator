import { describe, test } from "datacurator-core/utils/test"
import { currency_symbol_string_map, hide_currency_symbols, unhide_currency_symbols } from "./hide_currency_symbols"


// This functionality definitely belongs inside the Simulation.js package
// https://github.com/AJamesPhillips/DataCurator/issues/239
export const test_currency_symbol_functions = describe.delay("currency symbols", () =>
{
    const symbols_string = Object.keys(currency_symbol_string_map).join("")
    const currency_string = Object.values(currency_symbol_string_map).join("")


    describe("hide_currency_symbols", () =>
    {
        let calculation_string = ""
        let expected_converted_calculation = ""
        let result_calculation_string = ""

        calculation_string = `${symbols_string}90 ${symbols_string} / year`
        expected_converted_calculation = `${currency_string}90 ${currency_string} / year`
        result_calculation_string = hide_currency_symbols(calculation_string)
        test(result_calculation_string, expected_converted_calculation, "Convert currency symbols to ascii strings")
    })


    describe("unhide_currency_symbols", () =>
    {
        let result_units = ""
        let expected_converted_result_units = ""
        let converted_result_units = ""

        result_units = `${currency_string}90 ${currency_string} / year`
        expected_converted_result_units = `${symbols_string}90 ${symbols_string} / year`
        converted_result_units = unhide_currency_symbols(result_units)
        test(converted_result_units, expected_converted_result_units, "Converts currency ascii strings back to symbols")


        result_units = `Currency_pound90 Currency_pound / year`
        expected_converted_result_units = `£90 £ / year`
        converted_result_units = unhide_currency_symbols(result_units)
        test(converted_result_units, expected_converted_result_units, "Copes with Simulation.JS changing capitalisation of unit words")
    })

})
