import { CustomUnit } from "simulation"

import { describe, test } from "datacurator-core/utils/test"
import { uuid_v4_for_tests } from "../utils/uuid_v4_for_tests"
import { prepare_new_VAP_set } from "../wcomponent/CRUD_helpers/prepare_new_VAP_set"
import { prepare_new_contextless_wcomponent_object } from "../wcomponent/CRUD_helpers/prepare_new_wcomponent_object"
import { WComponentsById } from "../wcomponent/interfaces/SpecialisedObjects"
import { StateValueAndPredictionsSet } from "../wcomponent/interfaces/state"
import { VAPsType } from "../wcomponent/interfaces/VAPsType"
import { VALUE_POSSIBILITY_IDS } from "../wcomponent/value/parse_value"
import { MissingUnitsStrings } from "./interface"
import { CalculationResult, PlainCalculationObject } from "./interfaces"
import { error_is_units_error, perform_calculations } from "./perform_calculations"



export const test_perform_calculations = describe.delay("perform_calculations", () =>
{
    let calculations: PlainCalculationObject[] = []
    let calculation_results: CalculationResult[] = []
    let expected_calculation_results: CalculationResult[] = []
    let calculation_result: CalculationResult | undefined
    let expected_calculation_result: CalculationResult



    describe("basic functionality", () =>
    {
        calculations = []
        const wcomponents_by_id: WComponentsById = {}
        expected_calculation_results = []
        calculation_results = perform_calculations(calculations, wcomponents_by_id)
        test(calculation_results, expected_calculation_results, "No calculations should return no results")



        calculations = [
            { id: 0, name: "A", value: `3` },
            { id: 1, name: "B", value: `4` },
            { id: 2, name: "C", value: `[A] + [B]` },
        ]
        calculation_results = perform_calculations(calculations, wcomponents_by_id)
        expected_calculation_results = [
            { value: 3, units: "" },
            { value: 4, units: "" },
            { value: 7, units: "" },
        ]
        test(calculation_results, expected_calculation_results, "3 simple calculations should return 3 results")



        calculations = [
            { id: 0,  name: "A", value: `3 + 1` },
            { id: 1,  name: "C", value: `[A] + [some_undeclared_variable]` },
            { id: 2,  name: "D", value: `5 + 1` },
        ]
        calculation_results = perform_calculations(calculations, wcomponents_by_id)
        expected_calculation_results = [
            { value: 3 + 1, units: "" },
            { value: undefined, error: "The primitive [some_undeclared_variable] could not be found.", units: "" },
            { value: 5 + 1, units: "" },
        ]
        test(calculation_results, expected_calculation_results, "Failure to find a value should still perform other valid calculations")



        calculations = [
            { id: 0,  name: "A", value: `1 + 1` },
            { id: 1,  name: "A", value: `[A] * 2` },
            { id: 2,  name: "A", value: `[A] * 2` },
        ]
        calculation_results = perform_calculations(calculations, wcomponents_by_id)
        expected_calculation_results = [
            { value: 1 + 1, units: "" },
            { value: 4, units: "" },
            { value: 8, units: "" },
        ]
        test(calculation_results, expected_calculation_results, "Can cope with self reference")



        calculations = [
            { id: 0, name: " A ", value: `1 + 1` },
            { id: 1, name: "B", value: `[ A ] * 2` },
        ]
        calculation_results = perform_calculations(calculations, wcomponents_by_id)
        expected_calculation_results = [
            { value: 1 + 1, units: "" },
            { value: 4, units: "" },
        ]
        test(calculation_results, expected_calculation_results, "Can cope with references with spaces")
    })



    describe("formatting functionality", () =>
    {
        const wcomponents_by_id: WComponentsById = {}
        expected_calculation_results = []
        calculation_results = perform_calculations(calculations, wcomponents_by_id)

        calculations = [
            { id: 0, name: "A", value: `3,000,100.200` },
        ]
        calculation_results = perform_calculations(calculations, wcomponents_by_id)
        expected_calculation_results = [
            { value: 3000100.2, units: "" },
        ]
        test(calculation_results, expected_calculation_results, "Should be able to ignore commas")
    })



    const id1 = uuid_v4_for_tests(1)
    const base_id = 0
    let vap_set_1: StateValueAndPredictionsSet
    describe("Can use wcomponent values", () =>
    {
        vap_set_1 = prepare_new_VAP_set(VAPsType.number, undefined, [], base_id)
        vap_set_1.entries[0]!.value = "12.3"
        const wcomponent_1 = prepare_new_contextless_wcomponent_object({
            base_id,
            id: id1,
            title: "Some state component",
            type: "statev2",
            values_and_prediction_sets: [vap_set_1],
            units: "seconds"
        })
        const wcomponents_by_id: WComponentsById = {
            [id1]: wcomponent_1,
        }



        calculations = [
            { id: 0, name: "A", value: `@@${id1}`, units: "meters" },
        ]
        calculation_results = perform_calculations(calculations, wcomponents_by_id)
        expected_calculation_results = [
            { value: 12.3, units: "seconds", source_wcomponent_id: id1 },
        ]
        test(calculation_results, expected_calculation_results, "Can access a wcomponent's value and overrides any units given in calculation with wcomponent's units")



        calculations = [
            { id: 0, name: "A", value: `@@${id1} * 10`, units: "meters" },
        ]
        calculation_results = perform_calculations(calculations, wcomponents_by_id)
        expected_calculation_results = [
            { value: 123, units: "meters", source_wcomponent_id: id1 },
        ]
        test(calculation_results, expected_calculation_results, "Can reference wcomponent values in a calculation and uses units given, overriding components units")



        calculations = [
            { id: 0, name: "A", value: `@@${id1} * @@${id1}`, units: "meters" },
        ]
        calculation_results = perform_calculations(calculations, wcomponents_by_id)
        expected_calculation_results = [
            { value: 151.29, units: "meters" },
        ]
        test(calculation_results, expected_calculation_results, "Can reference same wcomponent values in a calculation but then will not give a reference to the original wcomponent i.e. wcomponent_id will be undefined")



        calculations = [
            { id: 0, name: "A", value: `{@@${id1} meters}` },
        ]
        calculation_results = perform_calculations(calculations, wcomponents_by_id)
        expected_calculation_results = [
            { value: 12.3, units: "meters", source_wcomponent_id: id1 },
        ]
        test.skip(calculation_results, expected_calculation_results, "Skipping because Simulation.JS does not allow referencing and setting units: ~~Calculations can reference wcomponent values and assign units~~")



        calculations = [
            { id: 0, name: "A", value: `@@${id1}.value`, units: "meters" },
        ]
        calculation_results = perform_calculations(calculations, wcomponents_by_id)
        expected_calculation_results = [
            { value: undefined, units: "meters", source_wcomponent_id: id1, error: "Object function not used on object" },
        ]
        test(calculation_results, expected_calculation_results, `Can not currently access the ".value" of a component in an equation`)
    })



    describe("Can use wcomponent boolean values", () =>
    {
        vap_set_1 = prepare_new_VAP_set(VAPsType.boolean, undefined, [], base_id)
        test(vap_set_1.entries[1]!.value_id, VALUE_POSSIBILITY_IDS.boolean_false, "Test is setting the correct VAP set entry")
        vap_set_1.entries[1]!.probability = 1

        const wcomponents_by_id: WComponentsById = {
            [id1]: prepare_new_contextless_wcomponent_object({
                base_id,
                id: id1,
                type: "statev2",
                subtype: "boolean",
                values_and_prediction_sets: [vap_set_1]
            }),
        }
        calculations = [
            { id: 0, name: "A", value: `IfThenElse(@@${id1}, 15, 10)` },
        ]
        calculation_results = perform_calculations(calculations, wcomponents_by_id)
        expected_calculation_results = [
            { value: 10, units: "", source_wcomponent_id: id1 },
        ]
        test(calculation_results, expected_calculation_results, "Can use wcomponent boolean values")
    })



    describe("Can use values with units", () =>
    {
        calculations = [
            { id: 0, name: "A", value: `{2 Meters} + {10 Centimeters}`, units: "Meters" },
        ]
        calculation_results = perform_calculations(calculations, {})
        expected_calculation_results = [
            { value: 2.10, units: "Meters" },
        ]
        test(calculation_results, expected_calculation_results, "Computes correct value and includes units in result")
    })



    describe("Can use values without units being initially defined", () =>
    {
        calculations = [
            { id: 0, name: "A", value: `{2 Meters}` },
        ]
        calculation_results = perform_calculations(calculations, {})
        expected_calculation_results = [
            { value: 2, units: "Meters" },
        ]
        test(calculation_results, expected_calculation_results, "Computes correct units")
    })



    describe("Can use values with units initially being undefined", () =>
    {
        calculations = [
            { id: 0, name: "A", value: `{2 Meters}`, units: undefined },
        ]
        calculation_results = perform_calculations(calculations, {})
        expected_calculation_results = [
            { value: 2, units: "Meters" },
        ]
        test(calculation_results, expected_calculation_results, "Computes correct units")
    })



    describe("Does not compute units if some are already specified", () =>
    {
        calculations = [
            { id: 0, name: "A", value: `{2 Meters}`, units: "kg" },
        ]
        calculation_results = perform_calculations(calculations, {})
        expected_calculation_results = [
            { value: undefined, units: "kg", error: "Wrong units generated for [A]. Expected Kg, and got Meters." },
        ]
        test(calculation_results, expected_calculation_results, "Computes correct units")
    })



    describe("Handling custom and missing puralisation of units", () =>
    {
        calculations = [
            { id: 0, name: "number of days per person", value: `1`, units: "days / person" },
            { id: 1, name: "number of seconds per person", value: `[number of days per person]`, units: "seconds / person" },
        ]
        calculation_results = perform_calculations(calculations, {})
        expected_calculation_results = [
            { value: 1, units: "days / person"},
            { value: 86400, units: "seconds / person"},
        ]
        test(calculation_results, expected_calculation_results, "Forces conversion of units")


        calculations = [
            { id: 0, name: "trades people", value: `180,000`, units: "people" },
            { id: 1, name: "people days per home", value: `30`, units: "people * days / home" },
            { id: 2, name: "days per year", value: `250`, units: "days / year" },
            { id: 3, name: "", value: `([trades people] * [days per year]) / [people days per home]`, units: "Home / Year" },
        ]
        calculation_results = perform_calculations(calculations, {}).slice(-1)
        expected_calculation_results = [
            { value: 1.5e6, units: "Home / Year"},
        ]
        test(calculation_results, expected_calculation_results, "Computes correct units")


        calculations = [
            { id: 0, name: "trades people", value: `180,000`, units: "people" },
            { id: 1, name: "people days per home", value: `30`, units: "people * days / home" },
            { id: 2, name: "days per year", value: `250`, units: "days / year" },
            { id: 3, name: "", value: `([trades people] * [days per year]) / [people days per home]`, units: "Homes / Year" },
        ]

        let custom_units: CustomUnit[] = []
        calculation_result = perform_calculations(calculations, {}, custom_units).pop()
        expected_calculation_result = {
            error: "Wrong units generated for [New Variable]. Expected Homes/(Year), and got Home/(Seconds).",
            units: "Homes / Year",
            suggested_custom_units: [
                { name: "home", scale: 1, target: "homes" },
            ],
            value: undefined,
        }
        test(calculation_result, expected_calculation_result, "Will fail to handle custom units when not given")

        custom_units = [{ name: "Homes", scale: 1, target: "Home" }]
        calculation_result = perform_calculations(calculations, {}, custom_units).pop()
        expected_calculation_result = { value: 1.5e6, units: "Homes / Year"}
        test(calculation_result, expected_calculation_result, "Can set custom units in either order, test 1")

        custom_units = [{ name: "Home", scale: 1, target: "Homes" }]
        calculation_result = perform_calculations(calculations, {}, custom_units).pop()
        expected_calculation_result = { value: 1.5e6, units: "Homes / Year"}
        test(calculation_result, expected_calculation_result, "Can set custom units in either order, test 2")

        custom_units = [{ name: "HoMe", scale: 1, target: "hOmEs" }]
        calculation_result = perform_calculations(calculations, {}, custom_units).pop()
        expected_calculation_result = { value: 1.5e6, units: "Homes / Year"}
        test(calculation_result, expected_calculation_result, "Can set custom units with mixed case")


        calculations = [
            { id: 0, name: "trades people", value: `180,000`, units: "people" },
            { id: 1, name: "people days per home", value: `30`, units: "people * days / home" },
            { id: 2, name: "days per year", value: `250`, units: "days / year" },
            { id: 3, name: "", value: `([trades people] * [days per year]) / [people days per home]`, units: "UK Dwellings / Year" },
        ]
        custom_units = [
            { name: "home", scale: 1, target: "homes" },
            { name: "UK Dwellings", scale: 1, target: "homes" },
        ]
        calculation_result = perform_calculations(calculations, {}, custom_units).pop()
        expected_calculation_result = { value: 1.5e6, units: "UK Dwellings / Year"}
        test(calculation_result, expected_calculation_result, "Can handle custom units with spaces in them")
    })



    describe(`Sets units to "" if 'Unitless' is specified`, () =>
    {
        calculations = [
            { id: 0, name: "A", value: `2`, units: "Unitless" },
        ]
        calculation_results = perform_calculations(calculations, {})
        expected_calculation_results = [
            { value: 2, units: "" },
        ]
        test(calculation_results, expected_calculation_results, `Computes correct units of "" when "Unitless" is specified`)



        calculations = [
            { id: 0, name: "A", value: `{2 Meters}`, units: "Unitless" },
        ]
        calculation_results = perform_calculations(calculations, {})
        expected_calculation_results = [
            { value: undefined, units: "", error: "Wrong units generated for [A]. Expected no units and got Meters. Either specify units for the primitive or adjust the equation." },
        ]
        test(calculation_results, expected_calculation_results, `Computes correct units of "" when "Unitless" is specified as the units even though it conflicts with units given in calculation`)
    })



    describe("Can process numbers with thousands comma seperators", () =>
    {
        calculations = [
            { id: 0, name: "A", value: "1,200,300e4 / {4,001,000e3 km}", units: "1/km" },
        ]
        calculation_results = perform_calculations(calculations, {})
        expected_calculation_results = [
            { value: 3, units: "1/km" },
        ]
        test(calculation_results, expected_calculation_results, "Can compute numbers with thousands commas")
    })



    describe("Can process numbers with compound units", () =>
    {
        calculations = [
            { id: 0, name: "A", value: "{7 Widgets/Years^2}*{10 Years}", units: "Widgets/Years" },
        ]
        calculation_results = perform_calculations(calculations, {})
        expected_calculation_results = [
            { value: 70, units: "Widgets/Years" },
        ]
        test(calculation_results, expected_calculation_results, "Widgets/Years^2  *  Years")
    })



    // Note these tests and this functionality belongs inside the Simulation.JS
    // package. See #239
    describe("hide_currency_symbols", () =>
    {
        calculations = [
            { id: 0, name: "A", value: `{90 £ / year}`, units: "" },
            { id: 1, name: "B", value: `{10 £ / year}`, units: "" },
            { id: 2, name: "C", value: `[A]+[B]`, units: "" },
        ]
        calculation_results = perform_calculations(calculations, {})
        expected_calculation_results = [
            { value: 90, units: "£/(Year)" },
            { value: 10, units: "£/(Year)" },
            { value: 100, units: "£/(Year)" },
        ]
        test(calculation_results, expected_calculation_results, "Handles currency symbols specified inside curly braces")



        calculations = [
            { id: 0, name: "A", value: `90`, units: "£ / year" },
            { id: 1, name: "B", value: `10`, units: "£ / year" },
            { id: 2, name: "C", value: `[A]+[B]`, units: "£ / year" },
        ]
        calculation_results = perform_calculations(calculations, {})
        expected_calculation_results = [
            { value: 90, units: "£ / year" },
            { value: 10, units: "£ / year" },
            { value: 100, units: "£ / year" },
        ]
        test(calculation_results, expected_calculation_results, "Handles currency symbols specified inside units field, and preserves them precisely")



        calculations = [
            { id: 0, name: "A", value: `90`, units: "£ / year" },
            { id: 1, name: "B", value: `10`, units: "$ / year" },
            { id: 2, name: "C", value: `[A]+[B]`, units: "£ / year" },
        ]
        calculation_results = perform_calculations(calculations, {})
        expected_calculation_results = [
            { value: 90, units: "£ / year" },
            { value: 10, units: "$ / year" },
            { value: undefined, units: "£ / year", error: "Incompatible units for the addition of £/(Year) and $/(Year)." },
        ]
        test(calculation_results, expected_calculation_results, "Correctly formats currency symbols in error messages")
    })



    describe("Handles reserved words correctly", () =>
    {
        calculations = [
            { id: 0, name: "A", value: `0.5 * (180 / Pi)` },
        ]
        calculation_results = perform_calculations(calculations, {})
        expected_calculation_results = [
            { value: 28.6478897565412, units: "" },
        ]
        test(calculation_results, expected_calculation_results, `Can run calculations using reserved word "Pi"`)
    })


    describe("Defaults to 1 for missing or invalid or incomplete components", () =>
    {
        calculations = [
            { id: 0, name: "A", value: `1 + @@${id1}` },
        ]


        describe("Missing component", () =>
        {
            expected_calculation_results = [
                {
                    value: 2,
                    units: "",
                    source_wcomponent_id: id1,
                    error: `Could not find wcomponent with id: @@${id1}.  Defaulting to value of 1.`,
                },
            ]
            calculation_results = perform_calculations(calculations, {})
            test(calculation_results, expected_calculation_results, `Can run calculations using missing uuids.  Will default to 1 and provide a warning.`)
        })


        describe("Invalid component: action type", () =>
        {
            expected_calculation_results = [
                {
                    value: 2,
                    units: "",
                    source_wcomponent_id: id1,
                    warning: `The wcomponent "no title" (@@${id1}) is of type "action".  Defaulting to value of 1.`,
                },
            ]

            const wcomponents_by_id: WComponentsById = {
                [id1]: prepare_new_contextless_wcomponent_object({
                    base_id,
                    id: id1,
                    type: "action",
                    values_and_prediction_sets: [],
                }),
            }
            calculation_results = perform_calculations(calculations, wcomponents_by_id)
            test(calculation_results, expected_calculation_results, `Can run calculations using actions.  Will default to 1 and provide a warning.`)
        })


        describe("Invalid component: statev2 with subtype number but invalid number parsed to null", () =>
        {
            expected_calculation_results = [
                {
                    value: 2,
                    units: "",
                    source_wcomponent_id: id1,
                    warning: `The wcomponent "no title" (@@${id1}) has an invalid number "".  Defaulting to value of 1.`,
                },
            ]

            vap_set_1 = prepare_new_VAP_set(VAPsType.number, undefined, [], base_id)
            vap_set_1.entries[0]!.value = ""

            const wcomponents_by_id: WComponentsById = {
                [id1]: prepare_new_contextless_wcomponent_object({
                    base_id,
                    id: id1,
                    type: "statev2",
                    subtype: "number",
                    values_and_prediction_sets: [vap_set_1],
                }),
            }
            calculation_results = perform_calculations(calculations, wcomponents_by_id)
            test(calculation_results, expected_calculation_results, `Can run calculations using statev2 with invalid number of null.  Will default to 1 and provide a warning.`)
        })


        describe("Invalid component: statev2 with subtype number but invalid number parsed to NaN", () =>
        {
            expected_calculation_results = [
                {
                    value: 2,
                    units: "",
                    source_wcomponent_id: id1,
                    warning: `The wcomponent "no title" (@@${id1}) has an invalid number "some invalid number".  Defaulting to value of 1.`,
                },
            ]

            vap_set_1 = prepare_new_VAP_set(VAPsType.number, undefined, [], base_id)
            vap_set_1.entries[0]!.value = "some invalid number"

            const wcomponents_by_id: WComponentsById = {
                [id1]: prepare_new_contextless_wcomponent_object({
                    base_id,
                    id: id1,
                    type: "statev2",
                    subtype: "number",
                    values_and_prediction_sets: [vap_set_1],
                }),
            }
            calculation_results = perform_calculations(calculations, wcomponents_by_id)
            test(calculation_results, expected_calculation_results, `Can run calculations using statev2 with invalid number of NaN.  Will default to 1 and provide a warning.`)
        })


        describe("Incomplete component: statev2 type with no VAP sets", () =>
        {
            expected_calculation_results = [
                {
                    value: 2,
                    units: "",
                    source_wcomponent_id: id1,
                    warning: `The wcomponent "no title" (@@${id1}) is missing any value and prediction sets.  Defaulting to value of 1.`,
                },
            ]

            const wcomponents_by_id: WComponentsById = {
                [id1]: prepare_new_contextless_wcomponent_object({
                    base_id,
                    id: id1,
                    type: "statev2",
                    values_and_prediction_sets: [],
                }),
            }
            calculation_results = perform_calculations(calculations, wcomponents_by_id)
            test(calculation_results, expected_calculation_results, `Can run calculations using statev2 with no VAPsets.  Will default to 1 and provide a warning.`)
        })
    })


    describe("Coerces statev2 wcomponents with boolean subtype into 0 or 1", () =>
    {
        calculations = [
            { id: 0, name: "A", value: `1 + @@${id1}` },
        ]


        describe("coerces true to 1", () =>
        {
            expected_calculation_results = [
                { value: 2, units: "", source_wcomponent_id: id1, },
            ]

            vap_set_1 = prepare_new_VAP_set(VAPsType.boolean, undefined, [], base_id)
            test(vap_set_1.entries[0]!.value_id, VALUE_POSSIBILITY_IDS.boolean_true, "Test is setting the correct VAP set entry")
            vap_set_1.entries[0]!.probability = 1

            const wcomponents_by_id: WComponentsById = {
                [id1]: prepare_new_contextless_wcomponent_object({
                    base_id,
                    id: id1,
                    type: "statev2",
                    subtype: "boolean",
                    values_and_prediction_sets: [vap_set_1],
                }),
            }
            calculation_results = perform_calculations(calculations, wcomponents_by_id)
            test(calculation_results, expected_calculation_results, `Can run calculations using statev2 boolean subtypes.  Will coerce true to 1 and not provide a warning.`)
        })


        describe("coerces false to 0", () =>
        {
            expected_calculation_results = [
                { value: 1, units: "", source_wcomponent_id: id1, },
            ]

            vap_set_1 = prepare_new_VAP_set(VAPsType.boolean, undefined, [], base_id)
            test(vap_set_1.entries[1]!.value_id, VALUE_POSSIBILITY_IDS.boolean_false, "Test is setting the correct VAP set entry")
            vap_set_1.entries[1]!.probability = 1

            const wcomponents_by_id: WComponentsById = {
                [id1]: prepare_new_contextless_wcomponent_object({
                    base_id,
                    id: id1,
                    type: "statev2",
                    subtype: "boolean",
                    values_and_prediction_sets: [vap_set_1],
                }),
            }
            calculation_results = perform_calculations(calculations, wcomponents_by_id)
            test(calculation_results, expected_calculation_results, `Can run calculations using statev2 boolean subtypes.  Will coerce false to 0 and not provide a warning.`)
        })

    })

})


export const test_error_is_units_error = describe.delay("error_is_units_error", () =>
{
    let error = new Error("Wrong units generated for [New Variable]. Expected Homes/(Year), and got Home/(Seconds).")
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    let result = error_is_units_error(error as any)
    let expected: MissingUnitsStrings = {
        expected_units: "Homes/(Year)",
        actual_units: "Home/(Seconds)",
    }
    test(result, expected, "Handles units error correctly")


    error = new Error("Wrong units generated for [A]. Expected no units and got Meters. Either specify units for the primitive or adjust the equation.")
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    result = error_is_units_error(error as any)
    expected = {
        expected_units: "",
        actual_units: "Meters",
    }
    test(result, expected, "Handles unitless error correctly")
})
