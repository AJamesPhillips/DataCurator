import { describe, test } from "./utils/test"
import { NumberDisplayType, format_number_to_string } from "./format_number_to_string"



export const run_number_to_string_test = describe("run_number_to_string_test", () =>
{
    let formatted_number = ""

    formatted_number = format_number_to_string(1264, 2, NumberDisplayType.bare)
    test(formatted_number, "1300", "bare number")

    formatted_number = format_number_to_string(1264, 2, NumberDisplayType.simple)
    test(formatted_number, "1,300", "simple number")

    formatted_number = format_number_to_string(1264, 2, NumberDisplayType.scaled)
    test(formatted_number, "1.3 thousand", "scaled number")

    formatted_number = format_number_to_string(1264, 2, NumberDisplayType.abbreviated_scaled)
    test(formatted_number, "1.3 k", "abbreviated scaled number")

    formatted_number = format_number_to_string(1264, 2, NumberDisplayType.scientific)
    test(formatted_number, "1.3e3", "scientific number")

    formatted_number = format_number_to_string(0.1264, -0.2, NumberDisplayType.scientific)
    test(formatted_number, "1e-1", "Copes with significant_figures that are fractional and or < 1")

    formatted_number = format_number_to_string(27000000, 2, NumberDisplayType.scaled)
    test(formatted_number, "27 million", "27 million")

    formatted_number = format_number_to_string(270000000, 2, NumberDisplayType.scaled)
    test(formatted_number, "270 million", "270 million")

    formatted_number = format_number_to_string(2700000000, 2, NumberDisplayType.scaled)
    test(formatted_number, "2.7 billion", "2.7 billion")


    describe("negative numbers", () =>
    {
        formatted_number = format_number_to_string(-1264, 2, NumberDisplayType.bare)
        test(formatted_number, "-1300", "bare number")

        formatted_number = format_number_to_string(-1264, 2, NumberDisplayType.simple)
        test(formatted_number, "-1,300", "simple number")

        formatted_number = format_number_to_string(-1264, 2, NumberDisplayType.scaled)
        test(formatted_number, "-1.3 thousand", "scaled number")

        formatted_number = format_number_to_string(-1264, 2, NumberDisplayType.abbreviated_scaled)
        test(formatted_number, "-1.3 k", "abbreviated scaled number")

        formatted_number = format_number_to_string(-1264, 2, NumberDisplayType.scientific)
        test(formatted_number, "-1.3e3", "scientific number")
    })


    describe("less than 1 numbers", () =>
    {
        formatted_number = format_number_to_string(0.001264, 2, NumberDisplayType.bare)
        test(formatted_number, "0.0013", "bare number")

        formatted_number = format_number_to_string(0.001264, 2, NumberDisplayType.simple)
        test(formatted_number, "0.0013", "simple number")

        // Currently don't expect milli, micro, nano, etc as I think these are
        // more confusing for most people than million, billion etc becoming a
        // milliaire is not an common aspiration.
        formatted_number = format_number_to_string(0.001264, 2, NumberDisplayType.scaled)
        test(formatted_number, "0.0013", "scaled number")

        formatted_number = format_number_to_string(0.001264, 2, NumberDisplayType.abbreviated_scaled)
        test(formatted_number, "0.0013", "abbreviated scaled number")

        formatted_number = format_number_to_string(0.001264, 2, NumberDisplayType.scientific)
        test(formatted_number, "1.3e-3", "scientific number")

        formatted_number = format_number_to_string(-0.001264, 2, NumberDisplayType.scientific)
        test(formatted_number, "-1.3e-3", "0> num >-1 scientific number")

    })


    describe("no unnecessary significant figures", () =>
    {
        formatted_number = format_number_to_string(1, 2, NumberDisplayType.bare)
        test(formatted_number, "1", "bare number")

        formatted_number = format_number_to_string(1, 2, NumberDisplayType.simple)
        test(formatted_number, "1", "simple number")

        formatted_number = format_number_to_string(1000, 2, NumberDisplayType.scaled)
        test(formatted_number, "1 thousand", "scaled number")

        formatted_number = format_number_to_string(1000, 2, NumberDisplayType.abbreviated_scaled)
        test(formatted_number, "1 k", "abbreviated scaled number")

        formatted_number = format_number_to_string(1000, 2, NumberDisplayType.scientific)
        test(formatted_number, "1e3", "scientific number")

    })

}, false)
