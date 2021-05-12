import { CounterfactualStateValueAndPrediction, merge_all_counterfactuals_into_all_VAPs } from "../../../knowledge/counterfactuals/merge"
import type { WComponentCounterfactuals } from "../../../state/derived/State"
import { test } from "../../utils/test"
import type {
    WComponentNodeStateV2,
    UIStateValue,
    StateValueAndPredictionsSet,
    UIStateValueType,
    StateValueAndPrediction,
    UIStateValueModifer,
} from "../interfaces/state"
import { partition_and_prune_items_by_datetimes } from "../utils_datetime"
import { get_VAPs_ordered_by_prob } from "./utils"



interface GetWcomponentStatev2ValueArgs
{
    wcomponent: WComponentNodeStateV2
    counterfactuals: WComponentCounterfactuals | undefined
    created_at_ms: number
    sim_ms: number
}
export function get_wcomponent_statev2_value (args: GetWcomponentStatev2ValueArgs): UIStateValue
{
    const { wcomponent, counterfactuals, created_at_ms, sim_ms } = args

    const { present_items } = partition_and_prune_items_by_datetimes({
        items: wcomponent.values_and_prediction_sets, created_at_ms, sim_ms,
    })

    const all_VAPs = get_all_VAPs_from_VAP_sets(present_items, wcomponent.subtype === "boolean")
    const VAP_counterfactuals_maps = Object.values(counterfactuals && counterfactuals.VAP_set || {})
    const counterfactual_VAPs = merge_all_counterfactuals_into_all_VAPs(all_VAPs, VAP_counterfactuals_maps)
    return get_probable_VAP_display_values(wcomponent, counterfactual_VAPs)
}



function get_probable_VAP_display_values (wcomponent: WComponentNodeStateV2, all_VAPs: CounterfactualStateValueAndPrediction[]): UIStateValue
{
    const { subtype } = wcomponent
    const is_boolean = subtype === "boolean"

    if (!all_VAPs.length) return { value: undefined, type: "single" }


    const VAPs_by_prob = get_VAPs_ordered_by_prob(all_VAPs, subtype)

    let value_strings: string[] = []
    let cf = false
    if (is_boolean)
    {
        // Should we return something that's neither true nor false if probability === 0.5?
        value_strings = VAPs_by_prob.map(VAP =>
        {
            cf = cf || VAP.is_counterfactual

            return VAP.probability > 0.5
            ? (wcomponent.boolean_true_str || "True")
            : (wcomponent.boolean_false_str || "False")
        })
    }
    else
    {
        value_strings = VAPs_by_prob.map(VAP =>
        {
            cf = cf || VAP.is_counterfactual
            return VAP.value
        })
    }


    let value = ""
    let type: UIStateValueType = "single"
    let modifier: UIStateValueModifer | undefined = undefined
    if (value_strings.length <= 1)
    {
        value = value_strings.join("")
        const single_VAP = VAPs_by_prob[0]
        if (single_VAP && ((single_VAP.probability > 0 && single_VAP.probability < 1) || single_VAP.conviction !== 1))
        {
            modifier = "uncertain"
        }
    }
    else
    {
        type = "multiple"
        value = value_strings.slice(0, 2).join(", ")
        if (value_strings.length > 2) value += `, (${value_strings.length - 2} more)`
    }

    if (cf) modifier = "assumed"

    return { value, type, modifier }
}



function get_all_VAPs_from_VAP_sets (VAP_sets: StateValueAndPredictionsSet[], wcomponent_is_boolean: boolean)
{
    let all_VAPs: StateValueAndPrediction[] = []
    VAP_sets.forEach(VAP_set =>
    {
        const subtype_specific_VAPs = (wcomponent_is_boolean
            ? VAP_set.entries.slice(0, 1)
            : VAP_set.entries.filter(({ probability, conviction }) =>
            {
                return !(probability === 0 && conviction === 1)
            }))

        const VAPs = subtype_specific_VAPs
            .filter(({ conviction }) =>
            {
                return conviction !== 0
            })

        all_VAPs = all_VAPs.concat(VAPs)
    })

    return all_VAPs
}



function run_tests ()
{
    console. log("running tests of get_probable_VAP_set_display_values")

    function get_probable_VAP_set_display_values (wcomponent: WComponentNodeStateV2, VAP_sets: StateValueAndPredictionsSet[])
    {
        const VAPs = get_all_VAPs_from_VAP_sets(VAP_sets, wcomponent.subtype === "boolean")
        const counterfactual_VAPs = merge_all_counterfactuals_into_all_VAPs(VAPs, [])
        return get_probable_VAP_display_values(wcomponent, counterfactual_VAPs)
    }


    const dt1 = new Date("2021-05-01 00:01")

    const wcomponent_other: WComponentNodeStateV2 = {
        id: "",
        created_at: dt1,
        type: "statev2",
        subtype: "other",
        title: "",
        description: "",
        values_and_prediction_sets: [],
    }
    const wcomponent_boolean: WComponentNodeStateV2 = {
        ...wcomponent_other,
        subtype: "boolean",
    }
    let display_value


    const VAP_defaults: StateValueAndPrediction = {
        id: "VAP0", value: "", probability: 1, conviction: 1, description: "", explanation: ""
    }


    const empty: StateValueAndPredictionsSet = {
        id: "", created_at: dt1, version: 1, datetime: {}, entries: []
    }
    const single: StateValueAndPredictionsSet = {
        id: "", created_at: dt1, version: 1, datetime: {}, entries: [
            { ...VAP_defaults, id: "VAP1", value: "A", probability: 1, conviction: 1 },
        ]
    }
    const multiple: StateValueAndPredictionsSet = {
        id: "", created_at: dt1, version: 1, datetime: {}, entries: [
            { ...VAP_defaults, id: "VAP1", value: "A", probability: 0.2, conviction: 1 },
            { ...VAP_defaults, id: "VAP2", value: "B", probability: 0.8, conviction: 1 },
        ]
    }
    const multiple_with_1certain: StateValueAndPredictionsSet = {
        id: "", version: 1, created_at: dt1, datetime: {}, entries: [
            { ...VAP_defaults, id: "VAP1", value: "AAA", probability: 1, relative_probability: 100, conviction: 1 },
            { ...VAP_defaults, id: "VAP2", value: "BBB", probability: 0, relative_probability: 0, conviction: 1 }
        ]
    }

    const no_chance: StateValueAndPredictionsSet = {
        id: "", created_at: dt1, version: 1, datetime: {}, entries: [
            { ...VAP_defaults, id: "VAP1", value: "A", probability: 0, conviction: 1 },
        ]
    }

    const uncertain_prob: StateValueAndPredictionsSet = {
        id: "", created_at: dt1, version: 1, datetime: {}, entries: [
            { ...VAP_defaults, id: "VAP1", value: "A", probability: 0.5, conviction: 1 },
        ]
    }
    const uncertain_cn: StateValueAndPredictionsSet = {
        id: "", created_at: dt1, version: 1, datetime: {}, entries: [
            { ...VAP_defaults, id: "VAP1", value: "A", probability: 1, conviction: 0.5 },
        ]
    }
    const certain_no_cn: StateValueAndPredictionsSet = {
        id: "", created_at: dt1, version: 1, datetime: {}, entries: [
            { ...VAP_defaults, id: "VAP1", value: "A", probability: 1, conviction: 0 },
        ]
    }


    display_value = get_probable_VAP_set_display_values(wcomponent_other, [])
    test(display_value, { value: undefined, type: "single" })

    display_value = get_probable_VAP_set_display_values(wcomponent_other, [empty])
    test(display_value, { value: undefined, type: "single" })

    display_value = get_probable_VAP_set_display_values(wcomponent_other, [single])
    test(display_value, { value: "A", type: "single" })

    display_value = get_probable_VAP_set_display_values(wcomponent_other, [multiple])
    test(display_value, { value: "B, A", type: "multiple" })
    display_value = get_probable_VAP_set_display_values(wcomponent_other, [multiple_with_1certain])
    test(display_value, { value: "AAA", type: "single" })

    display_value = get_probable_VAP_set_display_values(wcomponent_other, [single, single])
    test(display_value, { value: "A, A", type: "multiple" })

    display_value = get_probable_VAP_set_display_values(wcomponent_other, [single, single, single])
    test(display_value, { value: "A, A, (1 more)", type: "multiple" })

    display_value = get_probable_VAP_set_display_values(wcomponent_other, [multiple, multiple])
    test(display_value, { value: "B, B, (2 more)", type: "multiple" })

    // boolean

    display_value = get_probable_VAP_set_display_values(wcomponent_boolean, [single])
    test(display_value, { value: "True", type: "single" })

    display_value = get_probable_VAP_set_display_values({ ...wcomponent_boolean, boolean_true_str: "Yes" }, [single])
    test(display_value, { value: "Yes", type: "single" })

    // no chance

    display_value = get_probable_VAP_set_display_values(wcomponent_other, [no_chance])
    test(display_value, { value: undefined, type: "single" })

    // no chance boolean

    display_value = get_probable_VAP_set_display_values(wcomponent_boolean, [no_chance])
    test(display_value, { value: "False", type: "single" })

    display_value = get_probable_VAP_set_display_values({ ...wcomponent_boolean, boolean_false_str: "No" }, [no_chance])
    test(display_value, { value: "No", type: "single" })

    // uncertainty for "boolean" subtype

    display_value = get_probable_VAP_set_display_values(wcomponent_boolean, [uncertain_prob])
    test(display_value, { value: "False", type: "single", modifier: "uncertain" })

    display_value = get_probable_VAP_set_display_values(wcomponent_boolean, [uncertain_cn])
    test(display_value, { value: "True", type: "single", modifier: "uncertain" })

    display_value = get_probable_VAP_set_display_values(wcomponent_boolean, [certain_no_cn])
    test(display_value, { value: undefined, type: "single" })

    display_value = get_probable_VAP_set_display_values(wcomponent_boolean, [single, certain_no_cn])
    test(display_value, { value: "True", type: "single" })

    // uncertainty for "other" subtype

    display_value = get_probable_VAP_set_display_values(wcomponent_other, [uncertain_prob])
    test(display_value, { value: "A", type: "single", modifier: "uncertain" })

    display_value = get_probable_VAP_set_display_values(wcomponent_other, [uncertain_cn])
    test(display_value, { value: "A", type: "single", modifier: "uncertain" })

    display_value = get_probable_VAP_set_display_values(wcomponent_other, [certain_no_cn])
    test(display_value, { value: undefined, type: "single" })

    display_value = get_probable_VAP_set_display_values(wcomponent_other, [single, certain_no_cn])
    test(display_value, { value: "A", type: "single" })
}

run_tests()
