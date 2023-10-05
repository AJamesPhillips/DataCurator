import { describe, test } from "../shared/utils/test"
import { uuid_v4_for_tests } from "../utils/uuid_v4_for_tests"
import { prepare_new_contextless_wcomponent_object } from "./CRUD_helpers/prepare_new_wcomponent_object"
import { get_wcomponent_VAPs_represent } from "./get_wcomponent_VAPs_represent"
import {
    WComponent,
    wcomponent_is_allowed_to_have_state_VAP_sets,
    wcomponent_is_statev2,
    wcomponent_is_action,
    wcomponent_is_causal_link,
    WComponentsById,
    wcomponent_is_state_value,
} from "./interfaces/SpecialisedObjects"
import type { WComponentStateV2SubType } from "./interfaces/state"
import { VAPsType } from "./interfaces/VAPsType"



export const run_get_wcomponent_VAPs_represent_tests = describe("get_wcomponent_VAPs_represent", () =>
{
    const id1 = uuid_v4_for_tests(1)
    const id2 = uuid_v4_for_tests(2)

    let wcomponent: WComponent | undefined
    let target_wcomponent: WComponent | undefined
    let wcomponents_by_id: WComponentsById
    let wcomponent_ids_touched: Set<string> | undefined
    let expected_VAPs_represent: VAPsType
    let result_VAPs_represent: VAPsType

    wcomponent = undefined
    wcomponents_by_id = {}
    wcomponent_ids_touched = undefined
    expected_VAPs_represent = VAPsType.undefined
    result_VAPs_represent = get_wcomponent_VAPs_represent(wcomponent, wcomponents_by_id, wcomponent_ids_touched)
    test(result_VAPs_represent, expected_VAPs_represent, "Should return undefined for undefined WComponent")


    wcomponent = prepare_new_contextless_wcomponent_object({ base_id: -1, type: "statev2", subtype: undefined })
    wcomponents_by_id = {}
    wcomponent_ids_touched = undefined
    expected_VAPs_represent = VAPsType.undefined
    result_VAPs_represent = get_wcomponent_VAPs_represent(wcomponent, wcomponents_by_id, wcomponent_ids_touched)
    test(result_VAPs_represent, expected_VAPs_represent, `Should return undefined for WComponent.type of "statev2" and subtype of undefined`)


    wcomponent = prepare_new_contextless_wcomponent_object({ base_id: -1, type: "statev2", subtype: "boolean" })
    wcomponents_by_id = {}
    wcomponent_ids_touched = undefined
    expected_VAPs_represent = VAPsType.boolean
    result_VAPs_represent = get_wcomponent_VAPs_represent(wcomponent, wcomponents_by_id, wcomponent_ids_touched)
    test(result_VAPs_represent, expected_VAPs_represent, `Should return boolean for WComponent.type of "statev2" and subtype of boolean`)


    wcomponent = prepare_new_contextless_wcomponent_object({ base_id: -1, type: "statev2", subtype: "number" })
    wcomponents_by_id = {}
    wcomponent_ids_touched = undefined
    expected_VAPs_represent = VAPsType.number
    result_VAPs_represent = get_wcomponent_VAPs_represent(wcomponent, wcomponents_by_id, wcomponent_ids_touched)
    test(result_VAPs_represent, expected_VAPs_represent, `Should return number for WComponent.type of "statev2" and subtype of number`)


    wcomponent = prepare_new_contextless_wcomponent_object({ base_id: -1, type: "statev2", subtype: "other" })
    wcomponents_by_id = {}
    wcomponent_ids_touched = undefined
    expected_VAPs_represent = VAPsType.other
    result_VAPs_represent = get_wcomponent_VAPs_represent(wcomponent, wcomponents_by_id, wcomponent_ids_touched)
    test(result_VAPs_represent, expected_VAPs_represent, `Should return other for WComponent.type of "statev2" and subtype of other`)


    describe("state_value", () =>
    {
        target_wcomponent = prepare_new_contextless_wcomponent_object({ base_id: -1, type: "statev2", subtype: "number" })
        wcomponent = prepare_new_contextless_wcomponent_object({ base_id: -1, type: "state_value", attribute_wcomponent_id: target_wcomponent.id })
        wcomponents_by_id = { [target_wcomponent.id]: target_wcomponent }
        wcomponent_ids_touched = undefined
        expected_VAPs_represent = VAPsType.number
        result_VAPs_represent = get_wcomponent_VAPs_represent(wcomponent, wcomponents_by_id, wcomponent_ids_touched)
        test(result_VAPs_represent, expected_VAPs_represent, `Should return number for WComponent.type of "state_value" targeting a stateV2 wcomponent with subtype of number`)


        target_wcomponent = prepare_new_contextless_wcomponent_object({ base_id: -1, type: "statev2", subtype: "boolean" })
        wcomponent = prepare_new_contextless_wcomponent_object({ base_id: -1, type: "state_value", attribute_wcomponent_id: target_wcomponent.id })
        wcomponents_by_id = { [target_wcomponent.id]: target_wcomponent }
        wcomponent_ids_touched = undefined
        expected_VAPs_represent = VAPsType.boolean
        result_VAPs_represent = get_wcomponent_VAPs_represent(wcomponent, wcomponents_by_id, wcomponent_ids_touched)
        test(result_VAPs_represent, expected_VAPs_represent, `Should return boolean for WComponent.type of "state_value" targeting a stateV2 wcomponent with subtype of boolean`)


        target_wcomponent = prepare_new_contextless_wcomponent_object({ base_id: -1, type: "statev2", subtype: "other" })
        wcomponent = prepare_new_contextless_wcomponent_object({ base_id: -1, type: "state_value", attribute_wcomponent_id: target_wcomponent.id })
        wcomponents_by_id = { [target_wcomponent.id]: target_wcomponent }
        wcomponent_ids_touched = undefined
        expected_VAPs_represent = VAPsType.other
        result_VAPs_represent = get_wcomponent_VAPs_represent(wcomponent, wcomponents_by_id, wcomponent_ids_touched)
        test(result_VAPs_represent, expected_VAPs_represent, `Should return other for WComponent.type of "state_value" targeting a stateV2 wcomponent with subtype of other`)


        wcomponent = prepare_new_contextless_wcomponent_object({ base_id: -1, type: "state_value", attribute_wcomponent_id: "some unknown uuid" })
        wcomponents_by_id = {}
        wcomponent_ids_touched = undefined
        expected_VAPs_represent = VAPsType.undefined
        // This was returning VAPsType.other... so perhaps some functionality
        // will break with this change
        result_VAPs_represent = get_wcomponent_VAPs_represent(wcomponent, wcomponents_by_id, wcomponent_ids_touched)
        test(result_VAPs_represent, expected_VAPs_represent, `Should return undefined for WComponent.type of "state_value" targeting an unknown stateV2 wcomponent`)


        describe("protected from recursion", () =>
        {
            wcomponent = prepare_new_contextless_wcomponent_object({
                base_id: -1,
                id: id1,
                type: "state_value",
                attribute_wcomponent_id: id1,
            })
            wcomponents_by_id = { [wcomponent.id]: wcomponent }
            wcomponent_ids_touched = undefined
            expected_VAPs_represent = VAPsType.undefined
            result_VAPs_represent = get_wcomponent_VAPs_represent(wcomponent, wcomponents_by_id, wcomponent_ids_touched)
            test(result_VAPs_represent, expected_VAPs_represent, `Should return undefined for WComponent.type of "state_value" targeting itself (accidentally)`)


            target_wcomponent = prepare_new_contextless_wcomponent_object({
                base_id: -1,
                id: id1,
                type: "state_value",
                attribute_wcomponent_id: id2,
            })
            wcomponent = prepare_new_contextless_wcomponent_object({
                base_id: -1,
                id: id2,
                type: "state_value",
                attribute_wcomponent_id: id1,
            })
            wcomponents_by_id = {
                [target_wcomponent.id]: target_wcomponent,
                [wcomponent.id]: wcomponent,
            }
            wcomponent_ids_touched = undefined
            expected_VAPs_represent = VAPsType.undefined
            result_VAPs_represent = get_wcomponent_VAPs_represent(wcomponent, wcomponents_by_id, wcomponent_ids_touched)
            test(result_VAPs_represent, expected_VAPs_represent, `Should return undefined for two WComponent.type of "state_value" targeting each other with infinite recursion`)
        })
    })


    describe("other types", () =>
    {
        wcomponent = prepare_new_contextless_wcomponent_object({ base_id: -1, type: "action" })
        wcomponents_by_id = {}
        wcomponent_ids_touched = undefined
        expected_VAPs_represent = VAPsType.action
        result_VAPs_represent = get_wcomponent_VAPs_represent(wcomponent, wcomponents_by_id, wcomponent_ids_touched)
        test(result_VAPs_represent, expected_VAPs_represent, `Should return action for WComponent.type of "action"`)


        wcomponent = prepare_new_contextless_wcomponent_object({ base_id: -1, type: "process" })
        wcomponents_by_id = {}
        wcomponent_ids_touched = undefined
        expected_VAPs_represent = VAPsType.undefined
        result_VAPs_represent = get_wcomponent_VAPs_represent(wcomponent, wcomponents_by_id, wcomponent_ids_touched)
        test(result_VAPs_represent, expected_VAPs_represent, `Should return undefined for WComponent.type of "process"`)


        wcomponent = prepare_new_contextless_wcomponent_object({ base_id: -1, type: "causal_link" })
        wcomponents_by_id = {}
        wcomponent_ids_touched = undefined
        expected_VAPs_represent = VAPsType.undefined
        result_VAPs_represent = get_wcomponent_VAPs_represent(wcomponent, wcomponents_by_id, wcomponent_ids_touched)
        test(result_VAPs_represent, expected_VAPs_represent, `Should return undefined for WComponent.type of "causal_link"`)
    })

}, false)
