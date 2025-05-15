import { CustomUnit } from "simulation"
import { describe, test } from "../shared/utils/test"
import { extract_units, suggest_missing_units } from "./suggest_missing_units"


export const test_extract_units = describe.delay("extract_units", () =>
{
    const units_string = "thing * kg * kg * meters / (second)"
    let result = extract_units(units_string, false, [])
    let expected_result = new Set(["thing", "kg", "meters", "seconds"])

    test(result, expected_result, "Extracts units from a string")


    result = extract_units(units_string, true, [])
    expected_result = new Set(["thing", "kg"])

    test(result, expected_result, "Ignores known units")


    result = extract_units(units_string, false, [
        { name: "kg", scale: 1, target: "kilograms" },
    ])
    expected_result = new Set(["thing", "kilograms", "meters", "seconds"])

    test(result, expected_result, "Converts known custom units")


    result = extract_units(units_string, true, [
        { name: "kg", scale: 1, target: "kilograms" },
    ])
    expected_result = new Set(["thing"])

    test(result, expected_result, "Ignores known units and known custom units")


    result = extract_units(units_string, false, [
        { name: "KG", scale: 1, target: "KILOGRAMS" },
    ])
    expected_result = new Set(["thing", "kilograms", "meters", "seconds"])

    test(result, expected_result, "Custom units with uppercase names are handled correctly")


    result = extract_units(units_string.toUpperCase(), false, [
        { name: "kg", scale: 1, target: "kilograms" },
    ])
    expected_result = new Set(["thing", "kilograms", "meters", "seconds"])

    test(result, expected_result, "Units string units with uppercase names are handled correctly")


    result = extract_units(units_string, true, [
        { name: "kg", scale: 1, target: "thing" },
    ])
    expected_result = new Set([])

    test(result, expected_result, "Units that are custom unit targets are ignored")


    result = extract_units("unitless", false, [])
    expected_result = new Set([])

    test(result, expected_result, "unitless is ignored")


    result = extract_units("", false, [])
    expected_result = new Set([])

    test(result, expected_result, "no units are ignored")
})


export const test_suggest_missing_units = describe.delay("suggest_missing_units", () =>
{
    const missing_units_strings = {
        expected_units: "niedźwiedz * Bear * Homes/Day",
        actual_units: "home * bears/(seconds)",
    }
    let custom_units: CustomUnit[] = []
    let result = suggest_missing_units(missing_units_strings, custom_units)
    let expected_result = {
        suggested_custom_units: [
            {
                name: "bear",
                scale: 1,
                target: "bears",
            },
            {
                name: "home",
                scale: 1,
                target: "homes",
            }
        ],
        unhandled_units: new Set(["niedźwiedz"]),
    }
    test(result, expected_result, "Suggests custom units")


    custom_units = [
        { name: "bear", scale: 1, target: "bears" },
        { name: "niedźwiedz", scale: 1, target: "bears" },
    ]
    result = suggest_missing_units(missing_units_strings, custom_units)
    expected_result = {
        suggested_custom_units: [
            { name: "home", scale: 1, target: "homes" },
        ],
        unhandled_units: new Set(),
    }

    test(result, expected_result, "Suggests custom units whilst ignoring known custom units")
})
