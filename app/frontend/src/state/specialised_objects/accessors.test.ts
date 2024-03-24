import { describe, test } from "../../shared/utils/test"
import { prepare_new_contextless_wcomponent_object } from "../../wcomponent/CRUD_helpers/prepare_new_wcomponent_object"
import { WComponent, WComponentsById } from "../../wcomponent/interfaces/SpecialisedObjects"
import { StateValueAndPredictionsSet } from "../../wcomponent/interfaces/state"
import { TemporalValueCertainty, get_current_temporal_value_certainty_from_wcomponent } from "./accessors"



export const run_specialised_objects_accessors_tests = describe("specialised_objects accessors tests", () =>
{
    describe("get_current_temporal_value_certainty_from_wcomponent", () =>
    {
        const dt1 = new Date("2023-10-09")
        const dt2 = new Date("2023-10-10")

        let VAP_sets: StateValueAndPredictionsSet[] | undefined = undefined
        let created_at_ms: number
        let result: TemporalValueCertainty | undefined
        let expected_temporal_uncertainty: TemporalValueCertainty | undefined

        function test_helper__get_current_temporal (VAP_sets: StateValueAndPredictionsSet[] | undefined, created_at_ms: number)
        {
            const wcomponent: WComponent = prepare_new_contextless_wcomponent_object({
                base_id: -1,
                created_at: dt1,
                type: "statev2",
                values_and_prediction_sets: VAP_sets,
            })
            const wcomponents_by_id: WComponentsById = { [wcomponent.id]: wcomponent }
            return get_current_temporal_value_certainty_from_wcomponent(wcomponent.id, wcomponents_by_id, created_at_ms)
        }



        created_at_ms = dt1.getTime()
        result = test_helper__get_current_temporal(undefined, created_at_ms)
        expected_temporal_uncertainty = undefined
        test(result, expected_temporal_uncertainty, "No VAP sets should result in undefined value")



        created_at_ms = dt1.getTime()
        result = test_helper__get_current_temporal([], created_at_ms)
        expected_temporal_uncertainty = undefined
        test(result, expected_temporal_uncertainty, "Empty VAP sets should result in undefined value")



        created_at_ms = dt1.getTime()
        VAP_sets = [
            { base_id: -1, id: "vps1", created_at: dt1, entries: [], datetime: {} }
        ]
        result = test_helper__get_current_temporal(VAP_sets, created_at_ms)
        expected_temporal_uncertainty = {
            certainty: undefined,
            temporal_uncertainty: {},
        }
        test(result, expected_temporal_uncertainty, "VAP sets with one VAPset should result in that VAP set's empty datetime being returned")



        created_at_ms = dt1.getTime()
        VAP_sets = [
            { base_id: -1, id: "vps1", created_at: dt1, entries: [], datetime: { value: dt2 } }
        ]
        result = test_helper__get_current_temporal(VAP_sets, created_at_ms)
        expected_temporal_uncertainty = {
            certainty: undefined,
            temporal_uncertainty: { value: dt2 },
        }
        test(result, expected_temporal_uncertainty, "VAP sets with one VAPset should result in that VAP set's datetime and value being returned")



        created_at_ms = dt1.getTime()
        VAP_sets = [
            { base_id: -1, id: "vps1", created_at: dt2, datetime: {}, entries: [] }
        ]
        result = test_helper__get_current_temporal(VAP_sets, created_at_ms)
        expected_temporal_uncertainty = undefined
        // Skipping because although the current behaviour is strange (a statev2
        // wcomponent changes colour to dark blue even when its VAPset is hidden
        // due to created_at filter) I am not sure if get_current_temporal_value_certainty_from_wcomponent
        // is the best place to add this functionality and perhaps the composed_wcomponents_by_id
        // might be better, i.e. apply the created_at at this point to filter and
        // remove all the "future" VAPsets
        test.skip(result, expected_temporal_uncertainty, "VAP sets with one VAPset created after current created_at should return undefined")



        created_at_ms = dt1.getTime()
        VAP_sets = [
            {
                base_id: -1,
                id: "vps1",
                created_at: dt1,
                datetime: { value: dt2 },
                entries: [
                    {
                        id: "", description: "", value: "", explanation: "",
                        probability: 1,
                        conviction: 1,
                    },
                ],
            }
        ]
        result = test_helper__get_current_temporal(VAP_sets, created_at_ms)
        expected_temporal_uncertainty = {
            certainty: 1,
            temporal_uncertainty: { value: dt2 },
        }
        test(result, expected_temporal_uncertainty, "VAP sets with one VAPset with an 100% probable & confident (conviction) entry should be 100% certain")



        created_at_ms = dt1.getTime()
        VAP_sets = [
            {
                base_id: -1,
                id: "vps1",
                created_at: dt1,
                datetime: { value: dt2 },
                entries: [
                    {
                        id: "", description: "", value: "", explanation: "",
                        probability: 0.5,
                        conviction: 0.5,
                    },
                    {
                        id: "", description: "", value: "", explanation: "",
                        probability: 0.9,
                        conviction: 0.9,
                    },
                ],
            }
        ]
        result = test_helper__get_current_temporal(VAP_sets, created_at_ms)
        expected_temporal_uncertainty = {
            certainty: 0.81,
            temporal_uncertainty: { value: dt2 },
        }
        test(result, expected_temporal_uncertainty, "VAP sets with one VAPset with two entries should take highest certainty")

    })

})
