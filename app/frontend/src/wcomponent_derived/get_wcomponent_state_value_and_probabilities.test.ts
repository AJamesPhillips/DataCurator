import { TemporalUncertainty } from "../shared/uncertainty/interfaces"
import { describe, test } from "../shared/utils/test"
import {
    StateValueAndPrediction,
    StateValueAndPredictionsSet,
    WComponentNodeStateV2,
} from "../wcomponent/interfaces/state"
import { get_wcomponent_state_value_and_probabilities } from "./get_wcomponent_state_value_and_probabilities"
import { VAPSetIdToCounterfactualV2Map } from "./interfaces/counterfactual"



export const test_get_wcomponent_state_value_and_probabilities = describe.delay("get_wcomponent_state_value_and_probabilities", () =>
{
    const dt0 = new Date("2021-05-01 00:00")
    const dt1 = new Date("2021-05-01 00:01")
    const dt2 = new Date("2021-05-01 00:02")


    interface CounterfactualV2Data
    {
        VAP_set_id: string
        VAP_id: string
    }


    function helper_func__make_VAP_set_id_to_counterfactual_v2_map (
        apply_counterfactuals_v2: (CounterfactualV2Data[]) | undefined,
        VAP_sets: StateValueAndPredictionsSet[] | undefined,
    ): VAPSetIdToCounterfactualV2Map | undefined
    {
        if (!apply_counterfactuals_v2 || !VAP_sets) return undefined

        const VAP_set_id_to_counterfactual_v2_map: VAPSetIdToCounterfactualV2Map = {}
        let counterfactual_id = 0

        apply_counterfactuals_v2.forEach(counterfactual_data =>
        {
            VAP_sets.forEach(VAP_set =>
            {
                if (counterfactual_data.VAP_set_id !== VAP_set.id) return

                const counterfactuals = VAP_set_id_to_counterfactual_v2_map[VAP_set.id] || []

                counterfactuals.push({
                    base_id: -1,
                    id: `cf${counterfactual_id++}`,
                    created_at: dt1,
                    type: "counterfactualv2",
                    title: "",
                    description: "",
                    target_wcomponent_id: "", // wcomponent.id,
                    target_VAP_set_id: VAP_set.id,
                    target_VAP_id: counterfactual_data.VAP_id,
                })

                VAP_set_id_to_counterfactual_v2_map[VAP_set.id] = counterfactuals

            })
        })

        return VAP_set_id_to_counterfactual_v2_map
    }


    function helper_func__make_VAP_sets (
        VAP_sets_data: Partial<StateValueAndPredictionsSet>[],
    ): StateValueAndPredictionsSet[]
    {
        return VAP_sets_data.map((partial, index) => ({
            base_id: -1,
            id: `vps${index}`,
            created_at: dt1,
            version: 1,
            datetime: {},
            entries: [],
            ...partial,
        }))
    }


    function helper_func__statev2_value (
        wcomponent: WComponentNodeStateV2,
        VAP_sets_data: StateValueAndPrediction[][],
        kwargs?: {
            apply_counterfactuals_v2?: CounterfactualV2Data[],
            datetime?: TemporalUncertainty,
        },
    )
    {
        const { apply_counterfactuals_v2, datetime = {} } = (kwargs || {})

        if (VAP_sets_data)
        {
            const flattened_VAP_sets_data = VAP_sets_data.map(entries => {
                return { datetime, entries }
            })
            const values_and_prediction_sets = helper_func__make_VAP_sets(flattened_VAP_sets_data)
            wcomponent = { ...wcomponent, values_and_prediction_sets }
        }

        const VAP_set_id_to_counterfactual_v2_map = helper_func__make_VAP_set_id_to_counterfactual_v2_map(apply_counterfactuals_v2, wcomponent.values_and_prediction_sets)

        return get_wcomponent_state_value_and_probabilities({
            wcomponent,
            VAP_set_id_to_counterfactual_v2_map,
            created_at_ms: dt1.getTime(),
            sim_ms: dt1.getTime(),
        })
    }


    const wcomponent__type_other: WComponentNodeStateV2 = {
        base_id: -1,
        id: "",
        created_at: dt1,
        type: "statev2",
        subtype: "other",
        title: "",
        description: "",
        values_and_prediction_sets: [],
    }
    const wcomponent__type_boolean: WComponentNodeStateV2 = {
        ...wcomponent__type_other,
        subtype: "boolean",
    }
    let display_value


    const VAP_defaults: StateValueAndPrediction = {
        id: "VAP0", value: "", probability: 1, conviction: 1, description: "", explanation: ""
    }


    const vap_p100: StateValueAndPrediction =    { ...VAP_defaults, id: "VAP100", value: "A100", probability: 1, conviction: 1 }
    const vap_p80: StateValueAndPrediction =     { ...vap_p100, id: "VAP80", value: "A80", probability: 0.8 }
    const vap_p20: StateValueAndPrediction =     { ...vap_p100, id: "VAP20", value: "A20", probability: 0.2 }
    const vap_p0: StateValueAndPrediction =      { ...vap_p100, id: "VAP0",  value: "A0",  probability: 0 }
    const vap_p100c80: StateValueAndPrediction = { ...vap_p100, id: "VAP100c50", value: "A100c50", conviction: 0.8 }
    const vap_p100c0: StateValueAndPrediction =  { ...vap_p100, id: "VAP100c0",  value: "A100c0",  conviction: 0 }

    // const uncertain_prob: StateValueAndPrediction[] = [vap_p20]
    const uncertain_cn: StateValueAndPrediction[] = [vap_p100c80]
    const certain_no_cn: StateValueAndPrediction[] = [vap_p100c0]


    describe("Basic functionality", () =>
    {

        display_value = helper_func__statev2_value(wcomponent__type_other, [])
        test(display_value, {
            most_probable_VAP_set_values: [],
            any_uncertainty: false,
            counterfactual_applied: undefined,
            derived__using_value_from_wcomponent_ids: undefined,
        }, "No VAP (value and prediction) defined")

        display_value = helper_func__statev2_value(wcomponent__type_other, [[]])
        test(display_value, {
            most_probable_VAP_set_values: [],
            any_uncertainty: false,
            counterfactual_applied: false,
            derived__using_value_from_wcomponent_ids: undefined,
        }, "No value defined in VAP (value and prediction)")

        display_value = helper_func__statev2_value(wcomponent__type_other, [[vap_p100]])
        test(display_value, {
            most_probable_VAP_set_values: [{ original_value: "A100", parsed_value: "A100", certainty: 1, conviction: 1, probability: 1, value_id: undefined }],
            any_uncertainty: false,
            counterfactual_applied: false,
            derived__using_value_from_wcomponent_ids: undefined,
        }, "Single with certainty")

        display_value = helper_func__statev2_value(wcomponent__type_other, [[vap_p20, vap_p80]])
        test(display_value, {
            most_probable_VAP_set_values: [
                { original_value: "A80", parsed_value: "A80", certainty: 0.8, conviction: 1, probability: 0.8, value_id: undefined },
                { original_value: "A20", parsed_value: "A20", certainty: 0.2, conviction: 1, probability: 0.2, value_id: undefined },
            ],
            any_uncertainty: true,
            counterfactual_applied: false,
            derived__using_value_from_wcomponent_ids: undefined,
        }, "Multiple with both uncertain")

        display_value = helper_func__statev2_value(wcomponent__type_other, [[vap_p100, vap_p20]])
        test(display_value, {
            most_probable_VAP_set_values: [{ original_value: "A100", parsed_value: "A100", certainty: 1, conviction: 1, probability: 1, value_id: undefined }],
            any_uncertainty: false,
            counterfactual_applied: false,
            derived__using_value_from_wcomponent_ids: undefined,
            // TODO: should set a flag saying there is inconsistent VAPs: one is 100% certain and the other(s) are not 0% certain.
        }, "Multiple with one certain, one uncertain, should only show certain")


        // Set up
        //   * three VAP sets, each with:
        //     * an increasing datetime.value
        //     * a different id
        //     * one single VAP with a different value
        let values_and_prediction_sets = helper_func__make_VAP_sets([
            { datetime: { value: dt0 }, id: "vap_set_0", entries: [{...vap_p100, value: "A100a" }]},
            { datetime: { value: dt1 }, id: "vap_set_1", entries: [{...vap_p100, value: "A100b" }]},
            { datetime: { value: dt2 }, id: "vap_set_2", entries: [{...vap_p100, value: "A100c" }]},
        ])
        let wcomponent: WComponentNodeStateV2 = { ...wcomponent__type_other, values_and_prediction_sets }
        display_value = get_wcomponent_state_value_and_probabilities({
            wcomponent,
            VAP_set_id_to_counterfactual_v2_map: undefined,
            created_at_ms: dt1.getTime(),
            sim_ms: dt1.getTime(),
        })
        test(display_value, {
            most_probable_VAP_set_values: [{ original_value: "A100b", parsed_value: "A100b", certainty: 1, conviction: 1, probability: 1, value_id: undefined }],
            any_uncertainty: false,
            counterfactual_applied: false,
            derived__using_value_from_wcomponent_ids: undefined,
        }, "Multiple VAP sets, each with one single VAP, should pick current VAP set")


        display_value = helper_func__statev2_value(wcomponent__type_other, [[vap_p0]])
        test(display_value, {
            most_probable_VAP_set_values: [],
            any_uncertainty: false,
            counterfactual_applied: false,
            derived__using_value_from_wcomponent_ids: undefined,
        }, "no chance: Should return no value when no chance")

    })


    describe("should use first VAP set when both VAP sets conflict at same datetime", () =>
    {
        display_value = helper_func__statev2_value(wcomponent__type_other, [[vap_p100], [vap_p20]])
        test(display_value, {
            most_probable_VAP_set_values: [
                { original_value: "A100", parsed_value: "A100", certainty: 1, conviction: 1, probability: 1, value_id: undefined },
            ],
            any_uncertainty: false,
            counterfactual_applied: false,
            derived__using_value_from_wcomponent_ids: undefined,
            // Perhaps add another field like:
            // conflicting_vap_sets: {ids:["vap_set_0", "vap_set_1"], datetime: dt1}
        }, "certain first and uncertain last")

        display_value = helper_func__statev2_value(wcomponent__type_other, [[vap_p20], [vap_p100]])
        test(display_value, {
            most_probable_VAP_set_values: [
                { original_value: "A20", parsed_value: "A20", certainty: 0.2, conviction: 1, probability: 0.2, value_id: undefined },
            ],
            any_uncertainty: true,
            counterfactual_applied: false,
            derived__using_value_from_wcomponent_ids: undefined,
            // Perhaps add another field like:
            // conflicting_vap_sets: {ids:["vap_set_0", "vap_set_1"], datetime: dt1}
        }, "uncertain first and certain last")
    })


    describe("handling boolean subtype", () =>
    {

        display_value = helper_func__statev2_value(wcomponent__type_boolean, [[vap_p0]])
        test(display_value, {
            most_probable_VAP_set_values: [
                { original_value: "A0", parsed_value: false, certainty: 0, conviction: 1, probability: 0, value_id: undefined },
            ],
            any_uncertainty: false,
            counterfactual_applied: false,
            derived__using_value_from_wcomponent_ids: undefined,
        }, "no chance boolean: Should return a value with probability of 0 when no chance of a boolean value")


        display_value = helper_func__statev2_value(wcomponent__type_boolean, [[vap_p100]])
        test(display_value, {
            most_probable_VAP_set_values: [
                { original_value: "A100", parsed_value: true, certainty: 1, conviction: 1, probability: 1, value_id: undefined },
            ],
            any_uncertainty: false,
            counterfactual_applied: false,
            derived__using_value_from_wcomponent_ids: undefined,
        }, "should handle boolean, probability of 1, by returning true")


        describe(`uncertainty for "boolean" subtype`, () =>
        {

            display_value = helper_func__statev2_value(wcomponent__type_boolean, [[vap_p20]])
            test(display_value, {
                most_probable_VAP_set_values: [
                    { original_value: "A20", parsed_value: false, certainty: 0.2, conviction: 1, probability: 0.2, value_id: undefined },
                ],
                any_uncertainty: true,
                counterfactual_applied: false,
                derived__using_value_from_wcomponent_ids: undefined,
            }, "should have any_uncertainty true when probability is < 1")

            display_value = helper_func__statev2_value(wcomponent__type_boolean, [uncertain_cn])
            test(display_value, {
                most_probable_VAP_set_values: [
                    { original_value: "A100c50", parsed_value: true, certainty: 0.8, conviction: 0.8, probability: 1, value_id: undefined },
                ],
                any_uncertainty: true,
                counterfactual_applied: false,
                derived__using_value_from_wcomponent_ids: undefined,
            }, "should have any_uncertainty true when conviction is < 1")

            display_value = helper_func__statev2_value(wcomponent__type_boolean, [certain_no_cn])
            test(display_value, {
                most_probable_VAP_set_values: [
                    { original_value: "A100c0", parsed_value: true, certainty: 0, conviction: 0, probability: 1, value_id: undefined },
                ],
                any_uncertainty: true,
                counterfactual_applied: false,
                derived__using_value_from_wcomponent_ids: undefined,
            }, "should have any_uncertainty true when conviction is 0")

        })

    })


    describe(`uncertainty for "other" subtype`, () =>
    {
        display_value = helper_func__statev2_value(wcomponent__type_other, [[vap_p20]])
        test(display_value, {
            most_probable_VAP_set_values: [
                { original_value: "A20", parsed_value: "A20", certainty: 0.2, conviction: 1, probability: 0.2, value_id: undefined },
            ],
            any_uncertainty: true,
            counterfactual_applied: false,
            derived__using_value_from_wcomponent_ids: undefined,
        }, "should have any_uncertainty true when probability is < 1")

        display_value = helper_func__statev2_value(wcomponent__type_other, [uncertain_cn])
        test(display_value, {
            most_probable_VAP_set_values: [
                { original_value: "A100c50", parsed_value: "A100c50", certainty: 0.8, conviction: 0.8, probability: 1, value_id: undefined },
            ],
            any_uncertainty: true,
            counterfactual_applied: false,
            derived__using_value_from_wcomponent_ids: undefined,
        }, "should have any_uncertainty true when conviction is < 1")

        display_value = helper_func__statev2_value(wcomponent__type_other, [certain_no_cn])
        test(display_value, {
            most_probable_VAP_set_values: [
                { original_value: "A100c0", parsed_value: "A100c0", certainty: 0, conviction: 0, probability: 1, value_id: undefined },
            ],
            any_uncertainty: true,
            counterfactual_applied: false,
            derived__using_value_from_wcomponent_ids: undefined,
        }, "should have any_uncertainty true when conviction is 0")

    })


    describe("counterfactuals", () =>
    {
        display_value = helper_func__statev2_value(wcomponent__type_other, [[vap_p100]], {
            apply_counterfactuals_v2: [{ VAP_set_id: "vps0", VAP_id: vap_p100.id }]
        })
        test(display_value, {
            most_probable_VAP_set_values: [
                { original_value: "A100", parsed_value: "A100", certainty: 1, conviction: 1, probability: 1, value_id: undefined },
            ],
            any_uncertainty: false,
            counterfactual_applied: true,
            derived__using_value_from_wcomponent_ids: ["cf0"],
        }, "No op counterfactual is applied to something already with certainty of 1")


        display_value = helper_func__statev2_value(wcomponent__type_other, [[vap_p80]], {
            apply_counterfactuals_v2: [{ VAP_set_id: "vps0", VAP_id: vap_p80.id }]
        })
        test(display_value, {
            most_probable_VAP_set_values: [
                { original_value: "A80", parsed_value: "A80", certainty: 1, conviction: 1, probability: 1, value_id: undefined },
            ],
            any_uncertainty: false,
            counterfactual_applied: true,
            derived__using_value_from_wcomponent_ids: ["cf0"],
        }, "Counterfactual applied to VAP that had certainty of < 1")


        display_value = helper_func__statev2_value(wcomponent__type_other, [[vap_p80, vap_p20]], {
            apply_counterfactuals_v2: [{ VAP_set_id: "vps0", VAP_id: vap_p20.id }]
        })
        test(display_value, {
            most_probable_VAP_set_values: [
                { original_value: "A20", parsed_value: "A20", certainty: 1, conviction: 1, probability: 1, value_id: undefined },
            ],
            any_uncertainty: false,
            counterfactual_applied: true,
            derived__using_value_from_wcomponent_ids: ["cf0"],
        }, "Counterfactual applied to VAP set with two VAPs that had certainty of < 1")


        display_value = helper_func__statev2_value(wcomponent__type_other, [[vap_p100, vap_p0]], {
            apply_counterfactuals_v2: [{ VAP_set_id: "vps0", VAP_id: vap_p0.id }]
        })
        test(display_value, {
            most_probable_VAP_set_values: [
                { original_value: "A0", parsed_value: "A0", certainty: 1, conviction: 1, probability: 1, value_id: undefined },
            ],
            any_uncertainty: false,
            counterfactual_applied: true,
            derived__using_value_from_wcomponent_ids: ["cf0"],
        }, "Counterfactuals to force one option possibility over another that was certain")


        // Counterfactuals to invalidate all options
        display_value = helper_func__statev2_value(wcomponent__type_other, [[vap_p100, vap_p0]]) //, [[{ probability: 0 }, { probability: 0 }]])
        // might change this to probability: 0, conviction: 1, but needs more thought/examples first
        test.skip(display_value, {
            most_probable_VAP_set_values: [
                { certainty: 1, conviction: 1, original_value: "A100", parsed_value: "A100", probability: 1, value_id: undefined }
            ],
            any_uncertainty: false,
            counterfactual_applied: true,
            derived__using_value_from_wcomponent_ids: ["123"],
        }, "Skipping because counterfactuals version 2 only works to force things to be true, not to be false.  For forcing something to be true, then you can use a StateValue component instead.")
    })



    describe("StateValue replacing VAPSets", () =>
    {
        // We're assuming that this derived_composed_wcomponent was processed by
        // and returned from the get_composed_wcomponents_by_id function
        const derived_composed_wcomponent: WComponentNodeStateV2 = {
            ...wcomponent__type_other,
            _derived__using_value_from_wcomponent_id: "abc123",
        }

        display_value = helper_func__statev2_value(derived_composed_wcomponent, [[vap_p100]])
        test(display_value, {
            most_probable_VAP_set_values: [
                { original_value: "A100", parsed_value: "A100", certainty: 1, conviction: 1, probability: 1, value_id: undefined },
            ],
            any_uncertainty: false,
            counterfactual_applied: false,
            derived__using_value_from_wcomponent_ids: ["abc123"],
        }, "Returns the id of the (state value) component whose VAP sets are present in this component")

        // todo add tests of when a StatevValue component overwrites the VAPSets
        // of a StateV2 component, and then it in turn has a counterfactual
        // applied to it or to its target StateV2 component
    })



    describe("Parsing \"number\" subtype", () =>
    {
        const wcomponent__type_number: WComponentNodeStateV2 = {
            ...wcomponent__type_other,
            subtype: "number",
        }

        const vap_num33: StateValueAndPrediction = { ...VAP_defaults, id: "VAP1", value: "33", probability: 1, conviction: 1 }
        const vap_num44abc: StateValueAndPrediction = { ...VAP_defaults, id: "VAP1", value: "44abc", probability: 1, conviction: 1 }

        display_value = helper_func__statev2_value(wcomponent__type_number, [[vap_num33]])
        test(display_value, {
            most_probable_VAP_set_values: [
                { original_value: "33", parsed_value: 33, certainty: 1, conviction: 1, probability: 1, value_id: undefined },
            ],
            any_uncertainty: false,
            counterfactual_applied: false,
            derived__using_value_from_wcomponent_ids: undefined,
        }, "Correctly parses valid number")

        display_value = helper_func__statev2_value(wcomponent__type_number, [[vap_num44abc]])
        test(display_value, {
            most_probable_VAP_set_values: [
                { original_value: "44abc", parsed_value: Number.NaN, certainty: 1, conviction: 1, probability: 1, value_id: undefined },
            ],
            any_uncertainty: false,
            counterfactual_applied: false,
            derived__using_value_from_wcomponent_ids: undefined,
        }, "Errors when parsing number appended with invalid characters")
        test(Number.isNaN(display_value.most_probable_VAP_set_values[0]?.parsed_value), true, "Error is Number.NaN")
    })



    describe("values before, at, after a datetime.min, datetime.value, datetime.max", () =>
    {
        describe("in the future", () =>
        {
            display_value = helper_func__statev2_value(wcomponent__type_other, [[vap_p100]], { datetime: { min: dt2 } })
            test(display_value, {
                most_probable_VAP_set_values: [],
                any_uncertainty: false,
                counterfactual_applied: undefined,
                derived__using_value_from_wcomponent_ids: undefined,
            }, "should not find any values when datetime.min is in future")

            display_value = helper_func__statev2_value(wcomponent__type_other, [[vap_p100]], { datetime: { value: dt2 } })
            test(display_value, {
                most_probable_VAP_set_values: [],
                any_uncertainty: false,
                counterfactual_applied: undefined,
                derived__using_value_from_wcomponent_ids: undefined,
            }, "should not find any values when datetime.value is in future")

            display_value = helper_func__statev2_value(wcomponent__type_other, [[vap_p100]], { datetime: { max: dt2 } })
            test(display_value, {
                most_probable_VAP_set_values: [
                    { original_value: "A100", parsed_value: "A100", certainty: 1, conviction: 1, probability: 1, value_id: undefined },
                ],
                any_uncertainty: false,
                counterfactual_applied: false,
                derived__using_value_from_wcomponent_ids: undefined,
            }, "should find the value when datetime.max is at the same time (or earlier)")
        })

        display_value = helper_func__statev2_value(wcomponent__type_other, [[vap_p100]], { datetime: { min: dt1 } })
        test(display_value, {
            most_probable_VAP_set_values: [
                { original_value: "A100", parsed_value: "A100", certainty: 1, conviction: 1, probability: 1, value_id: undefined },
            ],
            any_uncertainty: false,
            counterfactual_applied: false,
            derived__using_value_from_wcomponent_ids: undefined,
        }, "should find the value when datetime.min is at the same time (or earlier)")

        display_value = helper_func__statev2_value(wcomponent__type_other, [[vap_p100]], { datetime: { value: dt1 } })
        test(display_value, {
            most_probable_VAP_set_values: [
                { original_value: "A100", parsed_value: "A100", certainty: 1, conviction: 1, probability: 1, value_id: undefined },
            ],
            any_uncertainty: false,
            counterfactual_applied: false,
            derived__using_value_from_wcomponent_ids: undefined,
        }, "should find the value when datetime.value is at the same time (or earlier)")

        display_value = helper_func__statev2_value(wcomponent__type_other, [[vap_p100]], { datetime: { max: dt1 } })
        test(display_value, {
            most_probable_VAP_set_values: [
                { original_value: "A100", parsed_value: "A100", certainty: 1, conviction: 1, probability: 1, value_id: undefined },
            ],
            any_uncertainty: false,
            counterfactual_applied: false,
            derived__using_value_from_wcomponent_ids: undefined,
        }, "should find the value when datetime.max is at the same time (or earlier)")
    })

})
