import { HasBaseId } from "../shared/interfaces/base"
import { TemporalUncertainty } from "../shared/uncertainty/interfaces"
import { describe, test } from "../shared/utils/test"
import { prepare_new_contextless_wcomponent_object } from "../wcomponent/CRUD_helpers/prepare_new_wcomponent_object"
import { wcomponent_is_statev2 } from "../wcomponent/interfaces/SpecialisedObjects"
import { VAPsType } from "../wcomponent/interfaces/VAPsType"
import { StateValueAndPrediction, WComponentNodeStateV2, StateValueAndPredictionsSet } from "../wcomponent/interfaces/state"
import { get_wcomponent_state_value_and_probabilities } from "./get_wcomponent_state_value_and_probabilities"
import { VAPSetIdToCounterfactualV2Map } from "./interfaces/counterfactual"



export const test_get_wcomponent_state_value_and_probabilities = describe("get_wcomponent_state_value_and_probabilities", () =>
{
    const dt0 = new Date("2021-05-01 00:00")
    const dt1 = new Date("2021-05-01 00:01")
    const dt2 = new Date("2021-05-01 00:02")


    interface CounterfactualData
    {
        VAP_set_id: string
        VAP_id: string
    }


    function inflate_counterfactuals_data (counterfactuals_data: (CounterfactualData[]) | undefined, VAP_sets: StateValueAndPredictionsSet[])
    {
        const counterfactuals_VAP_set_map: VAPSetIdToCounterfactualV2Map = {}

        ;(counterfactuals_data || []).forEach(counterfactual_data =>
        {
            VAP_sets.forEach(VAP_set =>
            {
                if (counterfactual_data.VAP_set_id !== VAP_set.id) return

                const counterfactuals = counterfactuals_VAP_set_map[VAP_set.id] || []

                counterfactuals.push({
                    base_id: -1,
                    id: "",
                    created_at: dt1,
                    type: "counterfactualv2",
                    title: "",
                    description: "",
                    target_wcomponent_id: "", // wcomponent.id,
                    target_VAP_set_id: VAP_set.id,
                    target_VAP_id: counterfactual_data.VAP_id,
                })

                counterfactuals_VAP_set_map[VAP_set.id] = counterfactuals

            })
        })

        return counterfactuals_VAP_set_map
    }


    function helper_func__statev2_value (wcomponent: WComponentNodeStateV2, VAP_sets_data: StateValueAndPrediction[][], kwargs?: { counterfactuals_data?: CounterfactualData[], datetime?: TemporalUncertainty })
    {
        const { counterfactuals_data, datetime = {} } = (kwargs || {})

        const values_and_prediction_sets: StateValueAndPredictionsSet[] = VAP_sets_data.map((VAPs, i) => ({
            base_id: -1,
            id: `vps${i}`,
            created_at: dt1,
            version: 1,
            datetime,
            entries: VAPs,
        }))
        wcomponent = { ...wcomponent, values_and_prediction_sets }


        const VAP_set_id_to_counterfactual_v2_map = inflate_counterfactuals_data(counterfactuals_data, values_and_prediction_sets)


        return get_wcomponent_state_value_and_probabilities({
            wcomponent, VAP_set_id_to_counterfactual_v2_map, created_at_ms: dt1.getTime(), sim_ms: dt1.getTime(),
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


    const vap_p100: StateValueAndPrediction = { ...VAP_defaults, id: "VAP100", value: "A100", probability: 1, conviction: 1 }
    const vap_p80: StateValueAndPrediction = { ...vap_p100, id: "VAP80", value: "A80", probability: 0.8 }
    const vap_p20: StateValueAndPrediction = { ...vap_p100, id: "VAP20", value: "A20", probability: 0.2 }
    const vap_p0: StateValueAndPrediction = { ...vap_p100, id: "VAP0", value: "A0", probability: 0 }
    const vap_p100c50: StateValueAndPrediction = { ...vap_p100, id: "VAP100c50", value: "A100c50", conviction: 0.5 }
    const vap_p100c0: StateValueAndPrediction = { ...vap_p100, id: "VAP100c0", value: "A100c0", conviction: 0 }

    const empty: StateValueAndPrediction[] = []
    const single: StateValueAndPrediction[] = [vap_p100]
    const multiple: StateValueAndPrediction[] = [vap_p20, vap_p80]
    const multiple_with_1certain: StateValueAndPrediction[] = [vap_p100, vap_p0]
    const no_chance: StateValueAndPrediction[] = [vap_p0]


    const uncertain_prob: StateValueAndPrediction[] = [vap_p20]
    const uncertain_cn: StateValueAndPrediction[] = [vap_p100c50]
    const certain_no_cn: StateValueAndPrediction[] = [vap_p100c0]


    display_value = helper_func__statev2_value(wcomponent__type_other, [])
    test(display_value, {
        most_probable_VAP_set_values: [],
        any_uncertainty: false,
        counterfactual_applied: undefined,
    }, "No VAP (value and prediction) defined")

    display_value = helper_func__statev2_value(wcomponent__type_other, [empty])
    test(display_value, {
        most_probable_VAP_set_values: [],
        any_uncertainty: false,
        counterfactual_applied: false,
    }, "No value defined in VAP (value and prediction)")

    display_value = helper_func__statev2_value(wcomponent__type_other, [single])
    test(display_value, {
        most_probable_VAP_set_values: [{ parsed_value: "A100", certainty: 1, conviction: 1, probability: 1 }],
        any_uncertainty: false,
        counterfactual_applied: false,
    }, "Single with certainty")

    display_value = helper_func__statev2_value(wcomponent__type_other, [multiple])
    test(display_value, {
        most_probable_VAP_set_values: [
            { parsed_value: "A80", certainty: 0.8, conviction: 1, probability: 0.8 },
            { parsed_value: "A20", certainty: 0.2, conviction: 1, probability: 0.2 },
        ],
        any_uncertainty: true,
        counterfactual_applied: false,
    }, "Multiple with both uncertain")

    display_value = helper_func__statev2_value(wcomponent__type_other, [multiple_with_1certain])
    test(display_value, {
        most_probable_VAP_set_values: [{ parsed_value: "A100", certainty: 1, conviction: 1, probability: 1 }],
        any_uncertainty: false,
        counterfactual_applied: false,
    }, "Multiple with one uncertain")


    display_value = helper_func__statev2_value(wcomponent__type_other, [single, single])
    test(display_value, {
        most_probable_VAP_set_values: [{ parsed_value: "A100", certainty: 1, conviction: 1, probability: 1 }],
        any_uncertainty: false,
        counterfactual_applied: false,
    })

    display_value = helper_func__statev2_value(wcomponent__type_other, [single, single, single])
    test(display_value, {
        most_probable_VAP_set_values: [{ parsed_value: "A100", certainty: 1, conviction: 1, probability: 1 }],
        any_uncertainty: false,
        counterfactual_applied: false,
    })

    display_value = helper_func__statev2_value(wcomponent__type_other, [multiple, multiple])
    test(display_value, {
        most_probable_VAP_set_values: [
            { parsed_value: "A80", certainty: 0.8, conviction: 1, probability: 0.8 },
            { parsed_value: "A20", certainty: 0.2, conviction: 1, probability: 0.2 },
        ],
        any_uncertainty: true,
        counterfactual_applied: false,
    })


    // boolean

    display_value = helper_func__statev2_value(wcomponent__type_boolean, [single])
    test(display_value, {
        most_probable_VAP_set_values: [
            { parsed_value: true, certainty: 1, conviction: 1, probability: 1 },
        ],
        any_uncertainty: false,
        counterfactual_applied: false,
    })

    // display_value = helper_func__statev2_value({ ...wcomponent__type_boolean, boolean_true_str: "Yes" }, [single])
    // test(display_value, { value: "Yes", probability: 1, conviction: 1, type: "single" }, "Customised boolean string value")


    // no chance

    display_value = helper_func__statev2_value(wcomponent__type_other, [no_chance])
    test(display_value, {
        most_probable_VAP_set_values: [],
        any_uncertainty: false,
        counterfactual_applied: false,
    }, "Should return no value when no chance")

    // no chance boolean

    display_value = helper_func__statev2_value(wcomponent__type_boolean, [no_chance])
    test(display_value, {
        most_probable_VAP_set_values: [
            { parsed_value: false, certainty: 0, conviction: 1, probability: 0 },
        ],
        any_uncertainty: false,
        counterfactual_applied: false,
    }, "Should return a value with probability of 0 when no chance of a boolean value")

    // display_value = helper_func__statev2_value({ ...wcomponent__type_boolean, boolean_false_str: "No" }, [no_chance])
    // test(display_value, { value: "No", probability: 0, conviction: 1, type: "single" }, "Customised boolean string value when no chance")

    describe("uncertainty for \"boolean\" subtype", () =>
    {

        display_value = helper_func__statev2_value(wcomponent__type_boolean, [uncertain_prob])
        test(display_value, {
            most_probable_VAP_set_values: [
                { parsed_value: false, certainty: 0.2, conviction: 1, probability: 0.2 },
            ],
            any_uncertainty: true,
            counterfactual_applied: false,
        })

        display_value = helper_func__statev2_value(wcomponent__type_boolean, [uncertain_cn])
        test(display_value, {
            most_probable_VAP_set_values: [
                { parsed_value: true, certainty: 0.5, conviction: 0.5, probability: 1 },
            ],
            any_uncertainty: true,
            counterfactual_applied: false,
        })

        display_value = helper_func__statev2_value(wcomponent__type_boolean, [certain_no_cn])
        test(display_value, {
            most_probable_VAP_set_values: [
                { parsed_value: true, certainty: 0, conviction: 0, probability: 1 },
            ],
            any_uncertainty: true,
            counterfactual_applied: false,
        })

        display_value = helper_func__statev2_value(wcomponent__type_boolean, [single, certain_no_cn])
        test(display_value, {
            most_probable_VAP_set_values: [
                { parsed_value: true, certainty: 1, conviction: 1, probability: 1 },
            ],
            any_uncertainty: false,
            counterfactual_applied: false,
        })
    })



    describe("uncertainty for \"other\" subtype", () =>
    {
        display_value = helper_func__statev2_value(wcomponent__type_other, [uncertain_prob])
        test(display_value, {
            most_probable_VAP_set_values: [
                { parsed_value: "A20", certainty: 0.2, conviction: 1, probability: 0.2 },
            ],
            any_uncertainty: true,
            counterfactual_applied: false,
        })

        display_value = helper_func__statev2_value(wcomponent__type_other, [uncertain_cn])
        test(display_value, {
            most_probable_VAP_set_values: [
                { parsed_value: "A100c50", certainty: 0.5, conviction: 0.5, probability: 1 },
            ],
            any_uncertainty: true,
            counterfactual_applied: false,
        })

        display_value = helper_func__statev2_value(wcomponent__type_other, [certain_no_cn])
        test(display_value, {
            most_probable_VAP_set_values: [
                { parsed_value: "A100c0", certainty: 0, conviction: 0, probability: 1 },
            ],
            any_uncertainty: true,
            counterfactual_applied: false,
        })

        display_value = helper_func__statev2_value(wcomponent__type_other, [single, certain_no_cn])
        test(display_value, {
            most_probable_VAP_set_values: [
                { parsed_value: "A100", certainty: 1, conviction: 1, probability: 1 },
            ],
            any_uncertainty: false,
            counterfactual_applied: false,
        })
    })



    describe("counterfactuals", () =>
    {
        display_value = helper_func__statev2_value(wcomponent__type_other, [single], { counterfactuals_data: [{ VAP_set_id: "vps0", VAP_id: single[0]!.id }] })
        test(display_value, {
            most_probable_VAP_set_values: [
                { parsed_value: "A100", certainty: 1, conviction: 1, probability: 1 },
            ],
            any_uncertainty: false,
            counterfactual_applied: true,
        }, "No op counterfactual is applied to something already with certainty of 1")


        display_value = helper_func__statev2_value(wcomponent__type_other, [[vap_p80]], { counterfactuals_data: [{ VAP_set_id: "vps0", VAP_id: vap_p80.id }] })
        test(display_value, {
            most_probable_VAP_set_values: [
                { parsed_value: "A80", certainty: 1, conviction: 1, probability: 1 },
            ],
            any_uncertainty: false,
            counterfactual_applied: true,
        }, "Counterfactual applied to VAP that had certainty of < 1")


        display_value = helper_func__statev2_value(wcomponent__type_other, [[vap_p80, vap_p20]], { counterfactuals_data: [{ VAP_set_id: "vps0", VAP_id: vap_p20.id }] })
        test(display_value, {
            most_probable_VAP_set_values: [
                { parsed_value: "A20", certainty: 1, conviction: 1, probability: 1 },
            ],
            any_uncertainty: false,
            counterfactual_applied: true,
        }, "Counterfactual applied to VAP set with two VAPs that had certainty of < 1")


        display_value = helper_func__statev2_value(wcomponent__type_other, [[vap_p100, vap_p0]], { counterfactuals_data: [{ VAP_set_id: "vps0", VAP_id: vap_p0.id }] })
        test(display_value, {
            most_probable_VAP_set_values: [
                { parsed_value: "A0", certainty: 1, conviction: 1, probability: 1 },
            ],
            any_uncertainty: false,
            counterfactual_applied: true,
        }, "Counterfactuals to force one option possibility over another that was certain")


        // Counterfactuals to invalidate all options
        display_value = helper_func__statev2_value(wcomponent__type_other, [[vap_p100, vap_p0]]) //, [[{ probability: 0 }, { probability: 0 }]])
        // might change this to probability: 0, conviction: 1, but needs more thought/examples first
        test.skip(display_value, {
            most_probable_VAP_set_values: [],
            any_uncertainty: false,
            counterfactual_applied: true,
        }, "Skipping because counterfactuals version 2 only works to force things to be true, not to be false.  For forcing something to be true, then you can use a StateValue component instead.")
    })



    describe("StateValue replacing VAPSets", () =>
    {

    })



    describe.skip("TODO fix these another time.  values before, at, after a datetime.min, datetime.value, datetime.max", () =>
    {
        display_value = helper_func__statev2_value(wcomponent__type_other, [[vap_p100]], { datetime: { min: dt2 } })
        test(display_value, {
            most_probable_VAP_set_values: [
                { parsed_value: true, certainty: 1, conviction: 1, probability: 1 },
            ],
            any_uncertainty: false,
            counterfactual_applied: false,
        }) //{ value: undefined, probability: undefined, conviction: undefined, type: "single" })
        display_value = helper_func__statev2_value(wcomponent__type_other, [[vap_p100]], { datetime: { min: dt1 } })
        test(display_value, {
            most_probable_VAP_set_values: [
                { parsed_value: true, certainty: 1, conviction: 1, probability: 1 },
            ],
            any_uncertainty: false,
            counterfactual_applied: false,
        }) //{ value: "A100", probability: 1, conviction: 1, type: "single" })
        display_value = helper_func__statev2_value(wcomponent__type_other, [[vap_p100]], { datetime: { min: dt0 } })
        test(display_value, {
            most_probable_VAP_set_values: [
                { parsed_value: true, certainty: 1, conviction: 1, probability: 1 },
            ],
            any_uncertainty: false,
            counterfactual_applied: false,
        }) //{ value: "A100", probability: 1, conviction: 1, type: "single" })

        display_value = helper_func__statev2_value(wcomponent__type_other, [[vap_p100]], { datetime: { value: dt2 } })
        test(display_value, {
            most_probable_VAP_set_values: [
                { parsed_value: true, certainty: 1, conviction: 1, probability: 1 },
            ],
            any_uncertainty: false,
            counterfactual_applied: false,
        }) //   value: undefined, probability: undefined, conviction: undefined, type: "single" })
        display_value = helper_func__statev2_value(wcomponent__type_other, [[vap_p100]], { datetime: { value: dt1 } })
        test(display_value, {
            most_probable_VAP_set_values: [
                { parsed_value: true, certainty: 1, conviction: 1, probability: 1 },
            ],
            any_uncertainty: false,
            counterfactual_applied: false,
        }) //value: "A100", probability: 1, conviction: 1, type: "single" })
        display_value = helper_func__statev2_value(wcomponent__type_other, [[vap_p100]], { datetime: { value: dt0 } })
        test(display_value, {
            most_probable_VAP_set_values: [
                { parsed_value: true, certainty: 1, conviction: 1, probability: 1 },
            ],
            any_uncertainty: false,
            counterfactual_applied: false,
        }) //value: undefined, probability: undefined, conviction: undefined, type: "single" })

        display_value = helper_func__statev2_value(wcomponent__type_other, [[vap_p100]], { datetime: { max: dt2 } })
        test(display_value, {
            most_probable_VAP_set_values: [
                { parsed_value: true, certainty: 1, conviction: 1, probability: 1 },
            ],
            any_uncertainty: false,
            counterfactual_applied: false,
        }) //value: "A100", probability: 1, conviction: 1, type: "single" })
        display_value = helper_func__statev2_value(wcomponent__type_other, [[vap_p100]], { datetime: { max: dt1 } })
        test(display_value, {
            most_probable_VAP_set_values: [
                { parsed_value: true, certainty: 1, conviction: 1, probability: 1 },
            ],
            any_uncertainty: false,
            counterfactual_applied: false,
        }) //value: undefined, probability: undefined, conviction: undefined, type: "single" })
        display_value = helper_func__statev2_value(wcomponent__type_other, [[vap_p100]], { datetime: { max: dt0 } })
        test(display_value, {
            most_probable_VAP_set_values: [
                { parsed_value: true, certainty: 1, conviction: 1, probability: 1 },
            ],
            any_uncertainty: false,
            counterfactual_applied: false,
        }) //value: undefined, probability: undefined, conviction: undefined, type: "single" })
    })

}, false)
