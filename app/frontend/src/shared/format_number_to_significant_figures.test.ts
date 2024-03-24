import { describe, test } from "./utils/test"
import { format_number_to_significant_figures } from "./format_number_to_significant_figures"



export const run_number_to_significant_figures_test = describe("run_number_to_significant_figures_test", () =>
{
    let formatted_number = ""

    formatted_number = format_number_to_significant_figures(0, 2)
    test(formatted_number, "0", "Zero")


    describe("Positive numbers", () =>
    {
        formatted_number = format_number_to_significant_figures(2700000, 2)
        test(formatted_number, "2700000", "2.7 million to 2 sf")

        formatted_number = format_number_to_significant_figures(27000000, 2)
        test(formatted_number, "27000000", "27 million to 2 sf")

        formatted_number = format_number_to_significant_figures(270000000, 2)
        test(formatted_number, "270000000", "270 million to 2 sf")

        formatted_number = format_number_to_significant_figures(270000000.2, 2)
        test(formatted_number, "270000000", "270.2 million to 2 sf")
    })


    describe("Positive with decimals numbers", () =>
    {
        formatted_number = format_number_to_significant_figures(27, 5)
        test(formatted_number, "27.000", "27 to 5 sf")

        formatted_number = format_number_to_significant_figures(270000000.2, 10)
        test(formatted_number, "270000000.2", "270.2 million to 10 sf")

        formatted_number = format_number_to_significant_figures(270000000.2, 11)
        test(formatted_number, "270000000.20", "270.2 million to 11 sf")
    })


    describe("Negative numbers", () =>
    {
        formatted_number = format_number_to_significant_figures(-27, 5)
        test(formatted_number, "-27.000", "-27 to 5 sf")

        formatted_number = format_number_to_significant_figures(-270000000.2, 11)
        test(formatted_number, "-270000000.20", "-270.2 million to 11 sf")

        formatted_number = format_number_to_significant_figures(-270000000.2, 2)
        test(formatted_number, "-270000000", "-270.2 million to 2 sf")
    })


    describe("Small numbers", () =>
    {
        formatted_number = format_number_to_significant_figures(0.0001236, 3)
        test(formatted_number, "0.000124", "0.0001236 to 3 sf")

        formatted_number = format_number_to_significant_figures(0.0001236, 5)
        test(formatted_number, "0.00012360", "0.0001236 to 5 sf")

        formatted_number = format_number_to_significant_figures(-0.0001236, 3)
        test(formatted_number, "-0.000124", "-0.0001236 to 3 sf")

        formatted_number = format_number_to_significant_figures(-0.0001236, 5)
        test(formatted_number, "-0.00012360", "-0.0001236 to 5 sf")
    })


    describe("Floating point precision numbers", () =>
    {
        formatted_number = format_number_to_significant_figures(0.01264, 2)
        test(formatted_number, "0.013", "0.01264 to 2 sf, tests when floating point precision results in 0.013000000000000001")

        formatted_number = format_number_to_significant_figures(17.955*100, 7)
        test(formatted_number, "1795.500", "17.955*100 to 7 sf, tests when floating point precision results in 1795.4999999999998")
    })

})
