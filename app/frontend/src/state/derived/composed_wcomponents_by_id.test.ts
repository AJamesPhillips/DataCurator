import { describe, test } from "../../shared/utils/test"
import { uuid_v4_for_tests } from "../../utils/uuid_v4_for_tests"
import { prepare_new_contextless_wcomponent_object } from "../../wcomponent/CRUD_helpers/prepare_new_wcomponent_object"
import { WComponentNodeStateV2, WComponentStateValue } from "../../wcomponent/interfaces/state"
import type { RootState } from "../State"
import { get_starting_state } from "../starting_state"
import { get_composed_wcomponents_by_id } from "./composed_wcomponents_by_id"



export const test_get_composed_wcomponents_by_id = describe("get_composed_wcomponents_by_id", () =>
{
    const dt1 = new Date("2023-10-06")
    const dt2 = new Date("2023-10-07")
    const id1 = uuid_v4_for_tests(1)
    const id2 = uuid_v4_for_tests(2)

    let state: RootState
    let wcomponent_statev2: WComponentNodeStateV2
    let wcomponent_state_value: WComponentStateValue


    function test_helper__make_statev2 (partial: Partial<WComponentNodeStateV2>)
    {
        const wcomponent_statev2 = prepare_new_contextless_wcomponent_object({
            base_id: -1,
            type: "statev2",
            ...partial,
        }) as WComponentNodeStateV2

        return wcomponent_statev2
    }


    function test_helper__make_state_value (partial: Partial<WComponentStateValue>)
    {
        const wcomponent_state_value = prepare_new_contextless_wcomponent_object({
            base_id: -1,
            type: "state_value",
            ...partial,
        }) as WComponentStateValue

        return wcomponent_state_value
    }


    function test_helper__set_up_state (
        wcomponent_statev2: WComponentNodeStateV2,
        wcomponent_state_value: WComponentStateValue,
        created_at_datetime?: Date,
    )
    {
        const state = get_starting_state(false)
        state.derived.current_composed_knowledge_view = { composed_wc_id_map: {} } as any

        state.specialised_objects.wcomponents_by_id = {
            [wcomponent_statev2.id]: wcomponent_statev2,
            [wcomponent_state_value.id]: wcomponent_state_value,
        }
        state.derived.current_composed_knowledge_view!.composed_wc_id_map = {
            [wcomponent_statev2.id]: { left: 0, top: 0 },
            [wcomponent_state_value.id]: { left: 300, top: 0 },
        }

        if (created_at_datetime)
        {
            state.routing.args.created_at_datetime = created_at_datetime
            state.routing.args.created_at_ms = created_at_datetime.getTime()
        }

        return state
    }


    wcomponent_statev2 = test_helper__make_statev2({
        id: id2,
        values_and_prediction_sets: [
            { base_id: -1, id: "vps1", created_at: dt1, entries: [], datetime: {} }
        ],
    })
    wcomponent_state_value = test_helper__make_state_value({
        id: id1,
        values_and_prediction_sets: [
            { base_id: -1, id: "vps22222", created_at: dt1, entries: [], datetime: {} }
        ],
        attribute_wcomponent_id: wcomponent_statev2.id,
    })
    state = test_helper__set_up_state(wcomponent_statev2, wcomponent_state_value)

    const result = get_composed_wcomponents_by_id(state)
    const result_wcomponent_statev2 = (result[wcomponent_statev2.id] as WComponentNodeStateV2)
    const result_wcomponent_statev2_VAP_sets = result_wcomponent_statev2.values_and_prediction_sets!

    test(result_wcomponent_statev2_VAP_sets![0]!.id, "vps22222", "The composed wcomponent should have VAP sets from the state value component that targets it")
    test(result_wcomponent_statev2._derived__using_value_from_wcomponent_id, wcomponent_state_value.id, "The composed wcomponent should have _derived__using_value_from_wcomponent_id set to the state_value's ID")

}, false)
