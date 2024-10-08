import { get_new_knowledge_view_object } from "../../knowledge_view/create_new_knowledge_view"
import { describe, test } from "../../shared/utils/test"
import { uuid_v4_for_tests } from "../../utils/uuid_v4_for_tests"
import { prepare_new_contextless_wcomponent_object } from "../../wcomponent/CRUD_helpers/prepare_new_wcomponent_object"
import { WComponentsById } from "../../wcomponent/interfaces/SpecialisedObjects"
import { StateValueAndPredictionsSet, WComponentNodeStateV2, WComponentStateValue } from "../../wcomponent/interfaces/state"
import type { RootState } from "../State"
import { ACTIONS } from "../actions"
import { root_reducer } from "../reducer"
import { get_starting_state } from "../starting_state"



export const test_derived_composed_wcomponents_by_id_reducer = describe.delay("derived_composed_wcomponents_by_id_reducer", () =>
{
    const dt0 = new Date("2023-10-05")
    const dt1 = new Date("2023-10-06")
    const dt2 = new Date("2023-10-07")
    const id1 = uuid_v4_for_tests(1)
    const id2 = uuid_v4_for_tests(2)
    const id3 = uuid_v4_for_tests(3)

    let state: RootState
    let wcomponent_statev2: WComponentNodeStateV2
    let wcomponent_state_value: WComponentStateValue
    let result: WComponentsById
    let result_wcomponent_statev2: WComponentNodeStateV2 | undefined
    let result_wcomponent_statev2_VAP_sets: StateValueAndPredictionsSet[] | undefined



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
        let state_ = get_starting_state(false)

        const knowledge_view = get_new_knowledge_view_object({
            base_id: -1,
            id: id3,
            title: "Test KV",
            sort_type: "priority",
        }, {})
        state_ = root_reducer(state_, ACTIONS.specialised_object.upsert_knowledge_view({ knowledge_view }))
        state_ = root_reducer(state_, ACTIONS.routing.change_route({
            args: { view: "knowledge", subview_id: knowledge_view.id },
        }))

        state_ = root_reducer(state_, ACTIONS.specialised_object.upsert_wcomponent({
            wcomponent: wcomponent_statev2,
            add_to_knowledge_view: {
                id: knowledge_view.id,
                position: { left: 0, top: 0 },
            },
        }))

        state_ = root_reducer(state_, ACTIONS.specialised_object.upsert_wcomponent({
            wcomponent: wcomponent_state_value,
            add_to_knowledge_view: {
                id: knowledge_view.id,
                position: { left: 300, top: 0 },
            },
        }))

        if (created_at_datetime)
        {
            state_ = root_reducer(state_, ACTIONS.routing.change_route({ args: { created_at_datetime } }))
        }

        return state_
    }



    wcomponent_statev2 = test_helper__make_statev2({
        id: id2,
        created_at: dt1,
        values_and_prediction_sets: [
            { base_id: -1, id: "vps1", created_at: dt1, entries: [], datetime: {} }
        ],
    })
    wcomponent_state_value = test_helper__make_state_value({
        id: id1,
        created_at: dt1,
        values_and_prediction_sets: [
            { base_id: -1, id: "vps22222", created_at: dt1, entries: [], datetime: {} }
        ],
        attribute_wcomponent_id: wcomponent_statev2.id,
    })



    describe("state_value VAPs should be composed into statev2 wcomponent", () =>
    {
        state = test_helper__set_up_state(wcomponent_statev2, wcomponent_state_value, dt2)
        result = state.derived.composed_wcomponents_by_id
        result_wcomponent_statev2 = (result[wcomponent_statev2.id] as WComponentNodeStateV2 | undefined)
        result_wcomponent_statev2_VAP_sets = result_wcomponent_statev2?.values_and_prediction_sets || []

        test(result_wcomponent_statev2_VAP_sets[0]?.id, "vps22222", "The composed wcomponent should have VAP sets from the state value component that targets it")
        test(result_wcomponent_statev2?._derived__using_value_from_wcomponent_id, wcomponent_state_value.id, "The composed wcomponent should have _derived__using_value_from_wcomponent_id set to the state_value's ID")
    })



    describe("Components created after current created_at datetime are still present in composed_wcomponents_by_id", () =>
    {
        state = test_helper__set_up_state(wcomponent_statev2, wcomponent_state_value, dt0)
        result = state.derived.composed_wcomponents_by_id


        test(wcomponent_statev2.created_at.getTime() > state.routing.args.created_at_ms, true, "Double check the current created_at should filter out wcomponent_statev2 wcomponent based on its created_at")
        test(wcomponent_state_value.created_at.getTime() > state.routing.args.created_at_ms, true, "Double check the current created_at should filter out wcomponent_state_value wcomponent based on its created_at")
        test(new Set(Object.keys(result)), new Set([id1, id2]), "derived.composed_wcomponents_by_id should still contain the components when the created_at filter is set to before the created_at of the two components")
    })



    describe("state_value created after statev2 and filtered out by created_at datetime", () =>
    {
        wcomponent_statev2 = test_helper__make_statev2({
            id: id2,
            created_at: dt1,
            values_and_prediction_sets: [
                { base_id: -1, id: "vps1", created_at: dt1, entries: [], datetime: {} }
            ],
        })
        wcomponent_state_value = test_helper__make_state_value({
            id: id1,
            created_at: dt2,
            values_and_prediction_sets: [
                { base_id: -1, id: "vps22222", created_at: dt2, entries: [], datetime: {} }
            ],
            attribute_wcomponent_id: wcomponent_statev2.id,
        })
        state = test_helper__set_up_state(wcomponent_statev2, wcomponent_state_value, dt1)


        result = state.derived.composed_wcomponents_by_id
        result_wcomponent_statev2 = (result[wcomponent_statev2.id] as WComponentNodeStateV2 | undefined)
        result_wcomponent_statev2_VAP_sets = result_wcomponent_statev2?.values_and_prediction_sets || []

        test(result_wcomponent_statev2_VAP_sets[0]?.id, "vps1", "The composed wcomponent should have VAP sets from the original statev2 component as the state_value that targets it should be filtered out based on created_at time")
        test(result_wcomponent_statev2?._derived__using_value_from_wcomponent_id, undefined, "The composed wcomponent should NOT have _derived__using_value_from_wcomponent_id set")
    })



    describe("state_value VAPs filtered out by created_at datetime", () =>
    {
        wcomponent_statev2 = test_helper__make_statev2({
            id: id2,
            created_at: dt1,
            values_and_prediction_sets: [
                { base_id: -1, id: "vps1", created_at: dt1, entries: [], datetime: {} }
            ],
        })
        wcomponent_state_value = test_helper__make_state_value({
            id: id1,
            created_at: dt1,
            values_and_prediction_sets: [
                { base_id: -1, id: "vps22222", created_at: dt2, entries: [], datetime: {} }
            ],
            attribute_wcomponent_id: wcomponent_statev2.id,
        })
        state = test_helper__set_up_state(wcomponent_statev2, wcomponent_state_value, dt1)


        result = state.derived.composed_wcomponents_by_id
        result_wcomponent_statev2 = (result[wcomponent_statev2.id] as WComponentNodeStateV2 | undefined)
        result_wcomponent_statev2_VAP_sets = result_wcomponent_statev2?.values_and_prediction_sets || []

        test(result_wcomponent_statev2_VAP_sets.length, 0, "The composed wcomponent should have VAP sets from the state_value component that targets it but these VAPs should be filtered out based on created_at time")
        test(result_wcomponent_statev2?._derived__using_value_from_wcomponent_id, wcomponent_state_value.id, "The composed wcomponent should have _derived__using_value_from_wcomponent_id set")
    })

})
