import { describe, test } from "../shared/utils/test"
import { uuid_v4_for_tests } from "../utils/uuid_v4_for_tests"
import { prepare_new_VAP_set } from "../wcomponent/CRUD_helpers/prepare_new_VAP_set"
import { prepare_new_contextless_wcomponent_object } from "../wcomponent/CRUD_helpers/prepare_new_wcomponent_object"
import { WComponentsById } from "../wcomponent/interfaces/SpecialisedObjects"
import { VAPsType } from "../wcomponent/interfaces/VAPsType"
import { CalculationResult, PlainCalculationObject } from "./interfaces"
import { perform_calculations } from "./perform_calculations"



export const run_perform_calculations_test = describe("perform_calculations", () =>
{
    let calculations: PlainCalculationObject[] = []
    let wcomponents_by_id: WComponentsById = {}
    let calculation_result = perform_calculations(calculations, wcomponents_by_id)
    let expected_calculation_result: CalculationResult[] = []

    test(calculation_result, expected_calculation_result, "No calculations should return no results")



    calculations = [
        { name: "A", value: `3` },
        { name: "B", value: `4` },
        { name: "C", value: `[A] + B` },
    ]
    calculation_result = perform_calculations(calculations, wcomponents_by_id)
    expected_calculation_result = [
        { value: 3 },
        { value: 4 },
        { value: 7 },
    ]
    test(calculation_result, expected_calculation_result, "3 simple calculations should return 3 results")



    calculations = [
        { name: "A", value: `3 + 1` },
        { name: "C", value: `A + some_undeclared_variable` },
        { name: "D", value: `5 + 1` },
    ]
    calculation_result = perform_calculations(calculations, wcomponents_by_id)
    expected_calculation_result = [
        { value: 3 + 1 },
        { value: undefined, error: "The primitive [some_undeclared_variable] could not be found." },
        { value: 5 + 1 },
    ]
    test(calculation_result, expected_calculation_result, "Failure to find a value should still perform other valid calculations")



    calculations = [
        { name: "A", value: `1 + 1` },
        { name: "A", value: `A * 2` },
        { name: "A", value: `A * 2` },
    ]
    calculation_result = perform_calculations(calculations, wcomponents_by_id)
    expected_calculation_result = [
        { value: 1 + 1 },
        { value: 4 },
        { value: 8 },
    ]
    test(calculation_result, expected_calculation_result, "Can cope with self reference")



    calculations = [
        { name: " A ", value: `1 + 1` },
        { name: "B", value: `[ A ] * 2` },
    ]
    calculation_result = perform_calculations(calculations, wcomponents_by_id)
    expected_calculation_result = [
        { value: 1 + 1 },
        { value: 4 },
    ]
    test(calculation_result, expected_calculation_result, "Can cope with references with spaces")



    const id1 = uuid_v4_for_tests(1)
    const base_id = 0
    const vap_set_1 = prepare_new_VAP_set(VAPsType.number, undefined, [], base_id, {})
    vap_set_1.entries[0]!.value = "12.3"
    wcomponents_by_id = {
        [id1]: prepare_new_contextless_wcomponent_object({
            base_id,
            id: id1,
            type: "statev2",
            values_and_prediction_sets: [vap_set_1]
        }),
    }
    calculations = [
        { name: "A", value: `@@${id1} * 10` },
    ]
    calculation_result = perform_calculations(calculations, wcomponents_by_id)
    expected_calculation_result = [
        { value: 123 },
    ]
    test.skip(calculation_result, expected_calculation_result, "Can reference wcomponent values")

}, true)
