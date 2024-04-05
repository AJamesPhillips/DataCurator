import { describe, test } from "./utils/test"
import { format_number_to_string } from "./format_number_to_string"
import { NUMBER_DISPLAY_TYPES } from "./types"



export const run_number_to_string_test = describe.delay("run_number_to_string_test", () =>
{
    let formatted_number = ""

    formatted_number = format_number_to_string(1264, 2, NUMBER_DISPLAY_TYPES.bare)
    test(formatted_number, "1300", "bare number")

    formatted_number = format_number_to_string(1264, 2, NUMBER_DISPLAY_TYPES.simple)
    test(formatted_number, "1,300", "simple number")

    formatted_number = format_number_to_string(1264, 2, NUMBER_DISPLAY_TYPES.scaled)
    test(formatted_number, "1.3 thousand", "scaled number")

    formatted_number = format_number_to_string(0.1264, 2, NUMBER_DISPLAY_TYPES.percentage)
    test(formatted_number, "13%", "number as percentage")

    formatted_number = format_number_to_string(1264, 2, NUMBER_DISPLAY_TYPES.abbreviated_scaled)
    test(formatted_number, "1.3 k", "abbreviated scaled number")

    // formatted_number = format_number_to_string(27000000, 2, NUMBER_DISPLAY_TYPES.abbreviated_scaled)
    // test(formatted_number, "27 M", "27 million abbreviated scaled number has correct capitalisation of M")
    // TODO: add a NUMBER_DISPLAY_TYPES.abbreviated_scientific_scaled_number type ?

    formatted_number = format_number_to_string(1264, 2, NUMBER_DISPLAY_TYPES.scientific)
    test(formatted_number, "1.3e3", "scientific number")

    formatted_number = format_number_to_string(0.1264, -0.2, NUMBER_DISPLAY_TYPES.scientific)
    test(formatted_number, "1e-1", "Copes with significant_figures that are fractional and or < 1")

    formatted_number = format_number_to_string(27000000, 2, NUMBER_DISPLAY_TYPES.scaled)
    test(formatted_number, "27 million", "27 million")

    formatted_number = format_number_to_string(270000000, 2, NUMBER_DISPLAY_TYPES.scaled)
    test(formatted_number, "270 million", "270 million")

    formatted_number = format_number_to_string(2700000000, 2, NUMBER_DISPLAY_TYPES.scaled)
    test(formatted_number, "2.7 billion", "2.7 billion")


    describe("negative numbers", () =>
    {
        formatted_number = format_number_to_string(-1264, 2, NUMBER_DISPLAY_TYPES.bare)
        test(formatted_number, "-1300", "bare number")

        formatted_number = format_number_to_string(-1264, 2, NUMBER_DISPLAY_TYPES.simple)
        test(formatted_number, "-1,300", "simple number")

        formatted_number = format_number_to_string(-1264, 2, NUMBER_DISPLAY_TYPES.scaled)
        test(formatted_number, "-1.3 thousand", "scaled number")

        formatted_number = format_number_to_string(-0.1264, 2, NUMBER_DISPLAY_TYPES.percentage)
        test(formatted_number, "-13%", "percentage number")

        formatted_number = format_number_to_string(-1264, 2, NUMBER_DISPLAY_TYPES.abbreviated_scaled)
        test(formatted_number, "-1.3 k", "abbreviated scaled number")

        formatted_number = format_number_to_string(-1264, 2, NUMBER_DISPLAY_TYPES.scientific)
        test(formatted_number, "-1.3e3", "scientific number")
    })


    describe("less than 1 numbers", () =>
    {
        formatted_number = format_number_to_string(0.001264, 2, NUMBER_DISPLAY_TYPES.bare)
        test(formatted_number, "0.0013", "bare number")

        formatted_number = format_number_to_string(0.001264, 2, NUMBER_DISPLAY_TYPES.simple)
        test(formatted_number, "0.0013", "simple number")

        // Currently don't expect milli, micro, nano, etc as I think these are
        // more confusing for most people than million, billion etc becoming a
        // milliaire is not an common aspiration.
        formatted_number = format_number_to_string(0.001264, 2, NUMBER_DISPLAY_TYPES.scaled)
        test(formatted_number, "0.0013", "scaled number")

        formatted_number = format_number_to_string(0.001264, 2, NUMBER_DISPLAY_TYPES.percentage)
        test(formatted_number, "0.13%", "percentage number")

        formatted_number = format_number_to_string(0.001264, 2, NUMBER_DISPLAY_TYPES.abbreviated_scaled)
        test(formatted_number, "0.0013", "abbreviated scaled number")

        formatted_number = format_number_to_string(0.001264, 2, NUMBER_DISPLAY_TYPES.scientific)
        test(formatted_number, "1.3e-3", "scientific number")

        formatted_number = format_number_to_string(-0.001264, 2, NUMBER_DISPLAY_TYPES.scientific)
        test(formatted_number, "-1.3e-3", "0> num >-1 scientific number")

    })


    describe("no unnecessary significant figures", () =>
    {
        formatted_number = format_number_to_string(1, 2, NUMBER_DISPLAY_TYPES.bare)
        test(formatted_number, "1", "bare number")

        formatted_number = format_number_to_string(1, 2, NUMBER_DISPLAY_TYPES.simple)
        test(formatted_number, "1", "simple number")

        formatted_number = format_number_to_string(1000, 2, NUMBER_DISPLAY_TYPES.scaled)
        test(formatted_number, "1 thousand", "scaled number")

        formatted_number = format_number_to_string(10, 2, NUMBER_DISPLAY_TYPES.percentage)
        test(formatted_number, "1000%", "percentage number")

        formatted_number = format_number_to_string(1000, 2, NUMBER_DISPLAY_TYPES.abbreviated_scaled)
        test(formatted_number, "1 k", "abbreviated scaled number")

        formatted_number = format_number_to_string(1000, 2, NUMBER_DISPLAY_TYPES.scientific)
        test(formatted_number, "1e3", "scientific number")

    })


    describe("handles 0", () =>
    {
        formatted_number = format_number_to_string(0, 2, NUMBER_DISPLAY_TYPES.bare)
        test(formatted_number, "0", "bare number")

        formatted_number = format_number_to_string(0, 2, NUMBER_DISPLAY_TYPES.simple)
        test(formatted_number, "0", "simple number")

        formatted_number = format_number_to_string(0, 2, NUMBER_DISPLAY_TYPES.scaled)
        test(formatted_number, "0", "scaled number")

        formatted_number = format_number_to_string(0, 2, NUMBER_DISPLAY_TYPES.percentage)
        test(formatted_number, "0%", "percentage number")

        formatted_number = format_number_to_string(0, 2, NUMBER_DISPLAY_TYPES.abbreviated_scaled)
        test(formatted_number, "0", "abbreviated scaled number")

        formatted_number = format_number_to_string(0, 2, NUMBER_DISPLAY_TYPES.scientific)
        test(formatted_number, "0e0", "scientific number")

    })

})
