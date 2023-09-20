import { describe, test } from "../shared/utils/test"
import { perform_calculations } from "./perform_calculations"



export const run_perform_calculations_test = describe("perform_calculations", () =>
{
    let calculation_result = perform_calculations([], {})
    let expected_calculation_result: SimulationResult[] = []

    test(calculation_result, expected_calculation_result, "No calculations should return no results")
}, true)


    // // Mock arguments
    // const id1 = uuid_v4_for_tests(1)
    // calculation_strings = [
    //     { name: "A", value: `@@${id1} * 10` },
    //     { name: "B", value: `A + 3` },
    // ]

    // const base_id = 0
    // const vap_set_1 = prepare_new_VAP_set(VAPsType.number, undefined, [], base_id, {})
    // vap_set_1.entries[0]!.value = "12.3"
    // wcomponents_by_id = {[id1]: prepare_new_contextless_wcomponent_object({
    //     base_id,
    //     id: id1,
    //     type: "statev2",
    //     values_and_prediction_sets: [vap_set_1]
    // })}

