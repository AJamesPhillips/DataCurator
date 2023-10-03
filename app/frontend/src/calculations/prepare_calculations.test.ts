import { describe, test } from "../shared/utils/test"
import { uuid_v4_for_tests } from "../utils/uuid_v4_for_tests"
import { prepare_new_VAP_set } from "../wcomponent/CRUD_helpers/prepare_new_VAP_set"
import { prepare_new_contextless_wcomponent_object } from "../wcomponent/CRUD_helpers/prepare_new_wcomponent_object"
import { WComponentsById } from "../wcomponent/interfaces/SpecialisedObjects"
import { VAPsType } from "../wcomponent/interfaces/VAPsType"
import { StateValueAndPredictionsSet } from "../wcomponent/interfaces/state"
import { PlainCalculationObject } from "./interfaces"
import { prepare_calculations } from "./prepare_calculations"



export const run_prepare_calculations_tests = describe("prepare_calculations", () =>
{
    let calculations: PlainCalculationObject[]
    let wcomponents_by_id: WComponentsById
    let prepared_calculations: PlainCalculationObject[]
    let expected_prepared_calculations: PlainCalculationObject[]

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
        })
        wcomponents_by_id = {
            [id1]: wcomponent_1,
        }



        calculations = [
            { name: "A", value: `@@${id1}`, units: "" },
        ]
        expected_prepared_calculations = [
            { name: "A", value: `@@${id1}`, units: "seconds" },
        ]
        prepared_calculations = prepare_calculations(calculations, wcomponents_by_id)
        // Skipping because wcomponent's do not have a 'units' field yet or UI to set this value
        test.skip(prepared_calculations, expected_prepared_calculations, "Can access a wcomponent's value and uses units from component when no units given by calculation")



        calculations = [
            { name: "A", value: `@@${id1}`, units: "Unitless" },
        ]
        expected_prepared_calculations = [
            { name: "A", value: `@@${id1}`, units: "seconds" },
        ]
        prepared_calculations = prepare_calculations(calculations, wcomponents_by_id)
        // Skipping because wcomponent's do not have a 'units' field yet or UI to set this value
        test.skip(prepared_calculations, expected_prepared_calculations, "Can access a wcomponent's value and silently uses units from component even when units given by calculation")

    })

}, false)
