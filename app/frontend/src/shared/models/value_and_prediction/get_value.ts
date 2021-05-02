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
import { get_vaps_ordered_by_prob } from "./utils"



export function get_wcomponent_statev2_value (wcomponent: WComponentNodeStateV2, created_at_ms: number, sim_ms: number): UIStateValue
{
    const { present_items } = partition_and_prune_items_by_datetimes({
        items: wcomponent.values_and_prediction_sets, created_at_ms, sim_ms,
    })

    return get_probable_vap_set_display_values(wcomponent, present_items)
}



function get_probable_vap_set_display_values (wcomponent: WComponentNodeStateV2, present_items: StateValueAndPredictionsSet[]): UIStateValue {
    const { subtype } = wcomponent
    const is_boolean = subtype === "boolean"


    let all_vaps: StateValueAndPrediction[] = []
    present_items.forEach(vap_set =>
    {
        const vaps = is_boolean
            ? vap_set.entries.slice(0, 1)
            : vap_set.entries.filter(({ probability, conviction }) => probability > 0 || conviction < 1)
        all_vaps = all_vaps.concat(vaps)
    })


    if (!all_vaps.length) return { value: undefined, type: "single" }


    const vaps_by_prob = get_vaps_ordered_by_prob(all_vaps, subtype)

    let value_strings: string[] = []
    if (is_boolean)
    {
        value_strings = vaps_by_prob.map(vap => vap.probability > 0.5
            ? (wcomponent.boolean_true_str || "True")
            : (wcomponent.boolean_false_str || "False"))
    }
    else
    {
        value_strings = vaps_by_prob.map(e => e.value)
    }


    let value = ""
    let type: UIStateValueType = "single"
    let modifier: UIStateValueModifer | undefined = undefined
    if (value_strings.length <= 1)
    {
        value = value_strings.join("")
        const single_vap = vaps_by_prob[0]
        if (single_vap && (single_vap.probability > 0 && single_vap.probability < 1) || single_vap.conviction !== 1)
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

    return { value, type, modifier }
}



function run_tests ()
{
    console.log("running tests of get_probable_vap_set_display_values")

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


    const empty: StateValueAndPredictionsSet = {
        id: "", created_at: dt1, version: 1, datetime: {}, entries: []
    }
    const single: StateValueAndPredictionsSet = {
        id: "", created_at: dt1, version: 1, datetime: {}, entries: [
            { id: "vap1", value: "A", probability: 1, conviction: 1, description: "", explanation: "" },
        ]
    }
    const multiple: StateValueAndPredictionsSet = {
        id: "", created_at: dt1, version: 1, datetime: {}, entries: [
            { id: "vap1", value: "A", probability: 0.2, conviction: 1, description: "", explanation: "" },
            { id: "vap2", value: "B", probability: 0.8, conviction: 1, description: "", explanation: "" },
        ]
    }

    const no_chance: StateValueAndPredictionsSet = {
        id: "", created_at: dt1, version: 1, datetime: {}, entries: [
            { id: "vap1", value: "A", probability: 0, conviction: 1, description: "", explanation: "" },
        ]
    }

    const uncertain_prob: StateValueAndPredictionsSet = {
        id: "", created_at: dt1, version: 1, datetime: {}, entries: [
            { id: "vap1", value: "A", probability: 0.5, conviction: 1, description: "", explanation: "" },
        ]
    }
    const uncertain_cn: StateValueAndPredictionsSet = {
        id: "", created_at: dt1, version: 1, datetime: {}, entries: [
            { id: "vap1", value: "A", probability: 1, conviction: 0.5, description: "", explanation: "" },
        ]
    }


    display_value = get_probable_vap_set_display_values(wcomponent_other, [])
    test(display_value, { value: undefined, type: "single" })

    display_value = get_probable_vap_set_display_values(wcomponent_other, [empty])
    test(display_value, { value: undefined, type: "single" })

    display_value = get_probable_vap_set_display_values(wcomponent_other, [single])
    test(display_value, { value: "A", type: "single" })

    display_value = get_probable_vap_set_display_values(wcomponent_other, [multiple])
    test(display_value, { value: "B, A", type: "multiple" })

    display_value = get_probable_vap_set_display_values(wcomponent_other, [single, single])
    test(display_value, { value: "A, A", type: "multiple" })

    display_value = get_probable_vap_set_display_values(wcomponent_other, [single, single, single])
    test(display_value, { value: "A, A, (1 more)", type: "multiple" })

    display_value = get_probable_vap_set_display_values(wcomponent_other, [multiple, multiple])
    test(display_value, { value: "B, B, (2 more)", type: "multiple" })

    // boolean

    display_value = get_probable_vap_set_display_values(wcomponent_boolean, [single])
    test(display_value, { value: "True", type: "single" })

    display_value = get_probable_vap_set_display_values({ ...wcomponent_boolean, boolean_true_str: "Yes" }, [single])
    test(display_value, { value: "Yes", type: "single" })

    // no chance

    display_value = get_probable_vap_set_display_values(wcomponent_other, [no_chance])
    test(display_value, { value: undefined, type: "single" })

    // no chance boolean

    display_value = get_probable_vap_set_display_values(wcomponent_boolean, [no_chance])
    test(display_value, { value: "False", type: "single" })

    display_value = get_probable_vap_set_display_values({ ...wcomponent_boolean, boolean_false_str: "No" }, [no_chance])
    test(display_value, { value: "No", type: "single" })

    // uncertainty

    display_value = get_probable_vap_set_display_values(wcomponent_other, [uncertain_prob])
    test(display_value, { value: "A", type: "single", modifier: "uncertain" })

    display_value = get_probable_vap_set_display_values(wcomponent_other, [uncertain_cn])
    test(display_value, { value: "A", type: "single", modifier: "uncertain" })
}

run_tests()
