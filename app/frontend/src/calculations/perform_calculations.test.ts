import { describe, test } from "../shared/utils/test"
import { uuid_v4_for_tests } from "../utils/uuid_v4_for_tests"
import { prepare_new_VAP_set } from "../wcomponent/CRUD_helpers/prepare_new_VAP_set"
import { prepare_new_contextless_wcomponent_object } from "../wcomponent/CRUD_helpers/prepare_new_wcomponent_object"
import { WComponentsById } from "../wcomponent/interfaces/SpecialisedObjects"
import { VAPsType } from "../wcomponent/interfaces/VAPsType"
import { StateValueAndPredictionsSet } from "../wcomponent/interfaces/state"
import { VALUE_POSSIBILITY_IDS } from "../wcomponent/value/parse_value"
import { CalculationResult, PlainCalculationObject } from "./interfaces"
import { perform_calculations } from "./perform_calculations"



export const run_perform_calculations_test = describe.delay("perform_calculations", () =>
{
    let calculations: PlainCalculationObject[] = []
    let calculation_result: CalculationResult[] = []
    let expected_calculation_result: CalculationResult[] = []



    describe("basic functionality", () =>
    {
        calculations = []
        const wcomponents_by_id: WComponentsById = {}
        expected_calculation_result = []
        calculation_result = perform_calculations(calculations, wcomponents_by_id)
        test(calculation_result, expected_calculation_result, "No calculations should return no results")



        calculations = [
            { id: 0, name: "A", value: `3` },
            { id: 1, name: "B", value: `4` },
            { id: 2, name: "C", value: `[A] + [B]` },
        ]
        calculation_result = perform_calculations(calculations, wcomponents_by_id)
        expected_calculation_result = [
            { value: 3, units: "" },
            { value: 4, units: "" },
            { value: 7, units: "" },
        ]
        test(calculation_result, expected_calculation_result, "3 simple calculations should return 3 results")



        calculations = [
            { id: 0,  name: "A", value: `3 + 1` },
            { id: 1,  name: "C", value: `[A] + [some_undeclared_variable]` },
            { id: 2,  name: "D", value: `5 + 1` },
        ]
        calculation_result = perform_calculations(calculations, wcomponents_by_id)
        expected_calculation_result = [
            { value: 3 + 1, units: "" },
            { value: undefined, error: "The primitive [some_undeclared_variable] could not be found.", units: "" },
            { value: 5 + 1, units: "" },
        ]
        test(calculation_result, expected_calculation_result, "Failure to find a value should still perform other valid calculations")



        calculations = [
            { id: 0,  name: "A", value: `1 + 1` },
            { id: 1,  name: "A", value: `[A] * 2` },
            { id: 2,  name: "A", value: `[A] * 2` },
        ]
        calculation_result = perform_calculations(calculations, wcomponents_by_id)
        expected_calculation_result = [
            { value: 1 + 1, units: "" },
            { value: 4, units: "" },
            { value: 8, units: "" },
        ]
        test(calculation_result, expected_calculation_result, "Can cope with self reference")



        calculations = [
            { id: 0, name: " A ", value: `1 + 1` },
            { id: 1, name: "B", value: `[ A ] * 2` },
        ]
        calculation_result = perform_calculations(calculations, wcomponents_by_id)
        expected_calculation_result = [
            { value: 1 + 1, units: "" },
            { value: 4, units: "" },
        ]
        test(calculation_result, expected_calculation_result, "Can cope with references with spaces")
    })



    const id1 = uuid_v4_for_tests(1)
    const base_id = 0
    let vap_set_1: StateValueAndPredictionsSet
    describe("Can use wcomponent values", () =>
    {
        vap_set_1 = prepare_new_VAP_set(VAPsType.number, undefined, [], base_id, {})
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
        calculation_result = perform_calculations(calculations, wcomponents_by_id)
        expected_calculation_result = [
            { value: 12.3, units: "seconds", source_wcomponent_id: id1 },
        ]
        test(calculation_result, expected_calculation_result, "Can access a wcomponent's value and overrides any units given in calculation with wcomponent's units")



        calculations = [
            { id: 0, name: "A", value: `@@${id1} * 10`, units: "meters" },
        ]
        calculation_result = perform_calculations(calculations, wcomponents_by_id)
        expected_calculation_result = [
            { value: 123, units: "meters", source_wcomponent_id: id1 },
        ]
        test(calculation_result, expected_calculation_result, "Can reference wcomponent values in a calculation and uses units given, overriding components units")



        calculations = [
            { id: 0, name: "A", value: `@@${id1} * @@${id1}`, units: "meters" },
        ]
        calculation_result = perform_calculations(calculations, wcomponents_by_id)
        expected_calculation_result = [
            { value: 151.29, units: "meters" },
        ]
        test(calculation_result, expected_calculation_result, "Can reference same wcomponent values in a calculation but then will not give a reference to the original wcomponent i.e. wcomponent_id will be undefined")



        calculations = [
            { id: 0, name: "A", value: `{@@${id1} meters}` },
        ]
        calculation_result = perform_calculations(calculations, wcomponents_by_id)
        expected_calculation_result = [
            { value: 12.3, units: "meters", source_wcomponent_id: id1 },
        ]
        test.skip(calculation_result, expected_calculation_result, "Skipping because Simulation.JS does not allow referencing and setting units: ~~Calculations can reference wcomponent values and assign units~~")



        calculations = [
            { id: 0, name: "A", value: `@@${id1}.value`, units: "meters" },
        ]
        calculation_result = perform_calculations(calculations, wcomponents_by_id)
        expected_calculation_result = [
            { value: undefined, units: "meters", source_wcomponent_id: id1, error: "Object function not used on object" },
        ]
        test(calculation_result, expected_calculation_result, `Can not currently access the ".value" of a component in an equation`)
    })



    describe("Can use wcomponent boolean values", () =>
    {
        vap_set_1 = prepare_new_VAP_set(VAPsType.boolean, undefined, [], base_id, {})
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
        calculation_result = perform_calculations(calculations, wcomponents_by_id)
        expected_calculation_result = [
            { value: 10, units: "", source_wcomponent_id: id1 },
        ]
        test(calculation_result, expected_calculation_result, "Can use wcomponent boolean values")
    })



    describe("Can use values with units", () =>
    {
        calculations = [
            { id: 0, name: "A", value: `{2 Meters} + {10 Centimeters}`, units: "Meters" },
        ]
        calculation_result = perform_calculations(calculations, {})
        expected_calculation_result = [
            { value: 2.10, units: "Meters" },
        ]
        test(calculation_result, expected_calculation_result, "Computes correct value and includes units in result")
    })



    describe("Can use values without units being initially defined", () =>
    {
        calculations = [
            { id: 0, name: "A", value: `{2 Meters}` },
        ]
        calculation_result = perform_calculations(calculations, {})
        expected_calculation_result = [
            { value: 2, units: "Meters" },
        ]
        test(calculation_result, expected_calculation_result, "Computes correct units")
    })



    describe("Can use values with units initially being undefined", () =>
    {
        calculations = [
            { id: 0, name: "A", value: `{2 Meters}`, units: undefined },
        ]
        calculation_result = perform_calculations(calculations, {})
        expected_calculation_result = [
            { value: 2, units: "Meters" },
        ]
        test(calculation_result, expected_calculation_result, "Computes correct units")
    })



    describe("Does not compute units if some are already specified", () =>
    {
        calculations = [
            { id: 0, name: "A", value: `{2 Meters}`, units: "kg" },
        ]
        calculation_result = perform_calculations(calculations, {})
        expected_calculation_result = [
            { value: undefined, units: "kg", error: "Wrong units generated for [A]. Expected Kg, and got Meters." },
        ]
        test(calculation_result, expected_calculation_result, "Computes correct units")
    })



    describe(`Sets units to "" if 'Unitless' is specified`, () =>
    {
        calculations = [
            { id: 0, name: "A", value: `2`, units: "Unitless" },
        ]
        calculation_result = perform_calculations(calculations, {})
        expected_calculation_result = [
            { value: 2, units: "" },
        ]
        test(calculation_result, expected_calculation_result, `Computes correct units of "" when "Unitless" is specified`)



        calculations = [
            { id: 0, name: "A", value: `{2 Meters}`, units: "Unitless" },
        ]
        calculation_result = perform_calculations(calculations, {})
        expected_calculation_result = [
            { value: undefined, units: "", error: "Wrong units generated for [A]. Expected no units and got Meters. Either specify units for the primitive or adjust the equation." },
        ]
        test(calculation_result, expected_calculation_result, `Computes correct units of "" when "Unitless" is specified as the units even though it conflicts with units given in calculation`)
    })



    describe("Can process numbers with thousands comma seperators", () =>
    {
        calculations = [
            { id: 0, name: "A", value: "1,200,300e4 / {4,001,000e3 km}", units: "1/km" },
        ]
        calculation_result = perform_calculations(calculations, {})
        expected_calculation_result = [
            { value: 3, units: "1/km" },
        ]
        test(calculation_result, expected_calculation_result, "Can compute numbers with thousands commas")
    })



    describe("Can process numbers with compound units", () =>
    {
        calculations = [
            { id: 0, name: "A", value: "{7 Widgets/Years^2}*{10 Years}", units: "Widgets/Years" },
        ]
        calculation_result = perform_calculations(calculations, {})
        expected_calculation_result = [
            { value: 70, units: "Widgets/Years" },
        ]
        test(calculation_result, expected_calculation_result, "Widgets/Years^2  *  Years")
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
        calculation_result = perform_calculations(calculations, {})
        expected_calculation_result = [
            { value: 90, units: "£/(Year)" },
            { value: 10, units: "£/(Year)" },
            { value: 100, units: "£/(Year)" },
        ]
        test(calculation_result, expected_calculation_result, "Handles currency symbols specified inside curly braces")



        calculations = [
            { id: 0, name: "A", value: `90`, units: "£ / year" },
            { id: 1, name: "B", value: `10`, units: "£ / year" },
            { id: 2, name: "C", value: `[A]+[B]`, units: "£ / year" },
        ]
        calculation_result = perform_calculations(calculations, {})
        expected_calculation_result = [
            { value: 90, units: "£ / year" },
            { value: 10, units: "£ / year" },
            { value: 100, units: "£ / year" },
        ]
        test(calculation_result, expected_calculation_result, "Handles currency symbols specified inside units field, and preserves them precisely")



        calculations = [
            { id: 0, name: "A", value: `90`, units: "£ / year" },
            { id: 1, name: "B", value: `10`, units: "$ / year" },
            { id: 2, name: "C", value: `[A]+[B]`, units: "£ / year" },
        ]
        calculation_result = perform_calculations(calculations, {})
        expected_calculation_result = [
            { value: 90, units: "£ / year" },
            { value: 10, units: "$ / year" },
            { value: undefined, units: "£ / year", error: "Incompatible units for the addition of £/(Year) and $/(Year)." },
        ]
        test(calculation_result, expected_calculation_result, "Correctly formats currency symbols in error messages")
    })



    describe("Handles reserved words correctly", () =>
    {
        calculations = [
            { id: 0, name: "A", value: `0.5 * (180 / Pi)` },
        ]
        calculation_result = perform_calculations(calculations, {})
        expected_calculation_result = [
            { value: 28.6478897565412, units: "" },
        ]
        test(calculation_result, expected_calculation_result, `Can run calculations using reserved word "Pi"`)
    })


    describe("Defaults to 1 for missing or invalid or incomplete components", () =>
    {
        calculations = [
            { id: 0, name: "A", value: `1 + @@${id1}` },
        ]


        describe("Missing component", () =>
        {
            expected_calculation_result = [
                {
                    value: 2,
                    units: "",
                    source_wcomponent_id: id1,
                    error: `Could not find wcomponent with id: @@${id1}.  Defaulting to value of 1.`,
                },
            ]
            calculation_result = perform_calculations(calculations, {})
            test(calculation_result, expected_calculation_result, `Can run calculations using missing uuids.  Will default to 1 and provide a warning.`)
        })


        describe("Invalid component: action type", () =>
        {
            expected_calculation_result = [
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
            calculation_result = perform_calculations(calculations, wcomponents_by_id)
            test(calculation_result, expected_calculation_result, `Can run calculations using actions.  Will default to 1 and provide a warning.`)
        })


        describe("Invalid component: statev2 with subtype number but invalid number parsed to null", () =>
        {
            expected_calculation_result = [
                {
                    value: 2,
                    units: "",
                    source_wcomponent_id: id1,
                    warning: `The wcomponent "no title" (@@${id1}) has an invalid number "".  Defaulting to value of 1.`,
                },
            ]

            vap_set_1 = prepare_new_VAP_set(VAPsType.number, undefined, [], base_id, {})
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
            calculation_result = perform_calculations(calculations, wcomponents_by_id)
            test(calculation_result, expected_calculation_result, `Can run calculations using statev2 with invalid number of null.  Will default to 1 and provide a warning.`)
        })


        describe("Invalid component: statev2 with subtype number but invalid number parsed to NaN", () =>
        {
            expected_calculation_result = [
                {
                    value: 2,
                    units: "",
                    source_wcomponent_id: id1,
                    warning: `The wcomponent "no title" (@@${id1}) has an invalid number "some invalid number".  Defaulting to value of 1.`,
                },
            ]

            vap_set_1 = prepare_new_VAP_set(VAPsType.number, undefined, [], base_id, {})
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
            calculation_result = perform_calculations(calculations, wcomponents_by_id)
            test(calculation_result, expected_calculation_result, `Can run calculations using statev2 with invalid number of NaN.  Will default to 1 and provide a warning.`)
        })


        describe("Incomplete component: statev2 type with no VAP sets", () =>
        {
            expected_calculation_result = [
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
            calculation_result = perform_calculations(calculations, wcomponents_by_id)
            test(calculation_result, expected_calculation_result, `Can run calculations using statev2 with no VAPsets.  Will default to 1 and provide a warning.`)
        })
    })


    describe("Coerces statev2 wcomponents with boolean subtype into 0 or 1", () =>
    {
        calculations = [
            { id: 0, name: "A", value: `1 + @@${id1}` },
        ]


        describe("coerces true to 1", () =>
        {
            expected_calculation_result = [
                { value: 2, units: "", source_wcomponent_id: id1, },
            ]

            vap_set_1 = prepare_new_VAP_set(VAPsType.boolean, undefined, [], base_id, {})
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
            calculation_result = perform_calculations(calculations, wcomponents_by_id)
            test(calculation_result, expected_calculation_result, `Can run calculations using statev2 boolean subtypes.  Will coerce true to 1 and not provide a warning.`)
        })


        describe("coerces false to 0", () =>
        {
            expected_calculation_result = [
                { value: 1, units: "", source_wcomponent_id: id1, },
            ]

            vap_set_1 = prepare_new_VAP_set(VAPsType.boolean, undefined, [], base_id, {})
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
            calculation_result = perform_calculations(calculations, wcomponents_by_id)
            test(calculation_result, expected_calculation_result, `Can run calculations using statev2 boolean subtypes.  Will coerce false to 0 and not provide a warning.`)
        })

    })

})
