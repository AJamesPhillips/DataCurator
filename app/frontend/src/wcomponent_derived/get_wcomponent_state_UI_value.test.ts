import { TemporalUncertainty } from "../shared/uncertainty/interfaces"
import { describe, test } from "../shared/utils/test"
import {
    StateValueAndPrediction,
    WComponentNodeStateV2,
    StateValueAndPredictionsSet,
} from "../wcomponent/interfaces/state"
import { get_wcomponent_state_UI_value } from "./get_wcomponent_state_UI_value"
import { VAPSetIdToCounterfactualV2Map } from "./interfaces/counterfactual"



export const test_get_wcomponent_state_UI_value = describe.delay("get_wcomponent_state_UI_value", () =>
{
    const dt0 = new Date("2021-05-01 00:00")
    const dt1 = new Date("2021-05-01 00:01")
    const dt2 = new Date("2021-05-01 00:02")


    interface CounterfactualData
    {
        VAP_set_id: string
        VAP_id: string
    }


    function helper_func__inflate_counterfactuals_data (counterfactuals_data: CounterfactualData[], VAP_sets: StateValueAndPredictionsSet[])
    {
        const counterfactuals_VAP_set_map: VAPSetIdToCounterfactualV2Map = {}

        counterfactuals_data.forEach(counterfactual_data =>
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
        const { counterfactuals_data = [], datetime = {} } = (kwargs || {})

        const values_and_prediction_sets: StateValueAndPredictionsSet[] = VAP_sets_data.map((VAPs, i) => ({
            base_id: -1,
            id: `vps${i}`,
            created_at: dt1,
            version: 1,
            datetime,
            entries: VAPs,
        }))
        wcomponent = { ...wcomponent, values_and_prediction_sets }


        const VAP_set_id_to_counterfactual_v2_map = helper_func__inflate_counterfactuals_data(counterfactuals_data, values_and_prediction_sets)


        return get_wcomponent_state_UI_value({
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
    let display_value


    const VAP_defaults: StateValueAndPrediction = {
        id: "VAP0", value: "", probability: 1, conviction: 1, description: "", explanation: ""
    }


    const vap_p100: StateValueAndPrediction = { ...VAP_defaults, id: "VAP100", value: "A100", probability: 1, conviction: 1 }
    const vap_p80: StateValueAndPrediction = { ...vap_p100, id: "VAP80", value: "A80", probability: 0.8 }
    const vap_p20: StateValueAndPrediction = { ...vap_p100, id: "VAP20", value: "A20", probability: 0.2 }
    const vap_p0: StateValueAndPrediction = { ...vap_p100, id: "VAP0", value: "A0", probability: 0 }


    describe("Basic tests of get_wcomponent_state_UI_value", () =>
    {

        display_value = helper_func__statev2_value(wcomponent__type_other, [])
        test(display_value, undefined, "No VAP (value and prediction) sets should return undefined")

        display_value = helper_func__statev2_value(wcomponent__type_other, [[]])
        test(display_value, undefined, "No value defined in a VAP (value and prediction) set should return undefined")

        display_value = helper_func__statev2_value(wcomponent__type_other, [[{...vap_p100, value: "  "}]])
        test(display_value, {
            values_string: "not defined",
            counterfactual_applied: false,
            uncertain: false,
            derived__using_values_from_wcomponent_ids: undefined,
        }, "Single VAP with whitespace string value should be trimmed to nothing and then shown as 'not defined'")

        display_value = helper_func__statev2_value(wcomponent__type_other, [[vap_p100]])
        test(display_value, {
            values_string: "A100",
            counterfactual_applied: false,
            uncertain: false,
            derived__using_values_from_wcomponent_ids: undefined,
        }, "Single VAP with certainty")

        display_value = helper_func__statev2_value(wcomponent__type_other, [[vap_p20, vap_p80]])
        test(display_value, {
            values_string: "A80, A20",
            counterfactual_applied: false,
            uncertain: true,
            derived__using_values_from_wcomponent_ids: undefined,
        }, "Multiple VAPs with both uncertain should result in both being shown, with the most probable first")

        display_value = helper_func__statev2_value(wcomponent__type_other, [[vap_p0, vap_p100]])
        test(display_value, {
            values_string: "A100",
            counterfactual_applied: false,
            uncertain: false,
            derived__using_values_from_wcomponent_ids: undefined,
        }, "Two VAPs with one 0% certain first, should only show the certain one")

        display_value = helper_func__statev2_value(wcomponent__type_other, [[vap_p100, vap_p0]])
        test(display_value, {
            values_string: "A100",
            counterfactual_applied: false,
            uncertain: false,
            derived__using_values_from_wcomponent_ids: undefined,
        }, "Two VAPs with one 0% certain last, should only show the certain one")

        display_value = helper_func__statev2_value(wcomponent__type_other, [[vap_p20, vap_p20, vap_p20, vap_p20]])
        test(display_value, {
            values_string: "A20, A20, A20, (1 more)",
            counterfactual_applied: false,
            uncertain: true,
            derived__using_values_from_wcomponent_ids: undefined,
        }, `Shows "(1 more)" when there are more than 3 values`)

    })


    describe("number subtype", () =>
    {
        const wcomponent__type_number: WComponentNodeStateV2 = {
            ...wcomponent__type_other,
            subtype: "number",
        }

        const vap_num33: StateValueAndPrediction = { ...VAP_defaults, id: "VAP1", value: "33", probability: 1, conviction: 1 }
        display_value = helper_func__statev2_value(wcomponent__type_number, [[vap_num33]])
        test(display_value, {
            values_string: "33",
            counterfactual_applied: false,
            uncertain: false,
            derived__using_values_from_wcomponent_ids: undefined,
        }, "A valid number value string")


        const vap_num33abc: StateValueAndPrediction = { ...VAP_defaults, id: "VAP1", value: "33abc", probability: 1, conviction: 1 }
        display_value = helper_func__statev2_value(wcomponent__type_number, [[vap_num33abc]])
        test(display_value, {
            values_string: "NaN",
            counterfactual_applied: false,
            uncertain: false,
            derived__using_values_from_wcomponent_ids: undefined,
        }, "A number with invalid characters in value string")


        const vap_num33percent: StateValueAndPrediction = { ...VAP_defaults, id: "VAP1", value: "33%", probability: 1, conviction: 1 }
        display_value = helper_func__statev2_value(wcomponent__type_number, [[vap_num33percent]])
        test(display_value, {
            // Currently this is parsed as 0.33 by `parse_string_as_number`
            values_string: "0.33",
            counterfactual_applied: false,
            uncertain: false,
            derived__using_values_from_wcomponent_ids: undefined,
        }, "A valid number percentage")
    })


    describe("boolean subtype", () =>
    {
        const wcomponent__type_boolean: WComponentNodeStateV2 = { ...wcomponent__type_other, subtype: "boolean" }

        display_value = helper_func__statev2_value(wcomponent__type_boolean, [[vap_p100]])
        test(display_value, {
            values_string: "True",
            counterfactual_applied: false,
            uncertain: false,
            derived__using_values_from_wcomponent_ids: undefined,
        }, "100% confident boolean should render as True")

        display_value = helper_func__statev2_value(wcomponent__type_boolean, [[{ ...vap_p100, probability: 0.51 }]])
        test(display_value, {
            values_string: "True",
            counterfactual_applied: false,
            uncertain: true,
            derived__using_values_from_wcomponent_ids: undefined,
        }, ">50% confident boolean should render as True")

        display_value = helper_func__statev2_value(wcomponent__type_boolean, [[{ ...vap_p100, probability: 0.50 }]])
        test(display_value, {
            values_string: "False",
            counterfactual_applied: false,
            uncertain: true,
            derived__using_values_from_wcomponent_ids: undefined,
        }, "<=50% confident boolean should render as False")

        display_value = helper_func__statev2_value(wcomponent__type_boolean, [[vap_p0]])
        test(display_value, {
            values_string: "False",
            counterfactual_applied: false,
            uncertain: false,
            derived__using_values_from_wcomponent_ids: undefined,
        }, "0% confident boolean should render as False")
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
            values_string: "A100",
            counterfactual_applied: false,
            uncertain: false,
            derived__using_values_from_wcomponent_ids: ["abc123"],
        }, "Returns the id of the (state value) component whose VAP sets are present in this component")
    })


    describe("datetime", () =>
    {
        display_value = helper_func__statev2_value(wcomponent__type_other, [[vap_p100]], { datetime: { min: dt2 } })
        test(display_value, undefined, "When datetime.min is in the future, no value should be shown")

        display_value = helper_func__statev2_value(wcomponent__type_other, [[vap_p100]], { datetime: { min: dt1 } })
        test(display_value, {
            values_string: "A100",
            counterfactual_applied: false,
            uncertain: false,
            derived__using_values_from_wcomponent_ids: undefined,
        }, "When datetime.min is the present sim datetime, a value should be shown")

        display_value = helper_func__statev2_value(wcomponent__type_other, [[vap_p100]], { datetime: { max: dt1 } })
        test(display_value, {
            values_string: "A100",
            counterfactual_applied: false,
            uncertain: false,
            derived__using_values_from_wcomponent_ids: undefined,
        }, "When datetime.max is the present sim datetime, a value should be shown")

        display_value = helper_func__statev2_value(wcomponent__type_other, [[vap_p100]], { datetime: { max: dt0 } })
        test(display_value, {
            values_string: "A100",
            counterfactual_applied: false,
            uncertain: false,
            derived__using_values_from_wcomponent_ids: undefined,
        }, "When datetime.max is in the past, a value should still be shown because the 'max' represents the lastest time this change to state could have occured, and the state represents the most current value")

        display_value = helper_func__statev2_value(wcomponent__type_other, [[vap_p100]], { datetime: { value: dt2 } })
        test(display_value, undefined, "When datetime.value is the future, no value should be shown")

        display_value = helper_func__statev2_value(wcomponent__type_other, [[vap_p100]], { datetime: { value: dt1 } })
        test(display_value, {
            values_string: "A100",
            counterfactual_applied: false,
            uncertain: false,
            derived__using_values_from_wcomponent_ids: undefined,
        }, "When datetime.value is the present sim datetime, a value should be shown")

        display_value = helper_func__statev2_value(wcomponent__type_other, [[vap_p100]], { datetime: { value: dt0 } })
        test(display_value, {
            values_string: "A100",
            counterfactual_applied: false,
            uncertain: false,
            derived__using_values_from_wcomponent_ids: undefined,
        }, "When datetime.value is the past, a value should still be shown, for the same reason as when datetime.max is in the past")
    })

})
