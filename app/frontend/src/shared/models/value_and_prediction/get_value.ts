import { test } from "../../utils/test"
import type {
    WComponentNodeStateV2,
    UIStateValue,
    StateValueAndPredictionsSet,
    UIStateValueType,
    StateValueAndPrediction,
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
        const vaps = is_boolean ? vap_set.entries.slice(0, 1) : vap_set.entries
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
        value_strings = vaps_by_prob
            .filter(({ probability, conviction }) => probability > 0 || conviction < 1)
            .map(e => e.value)
    }


    let value = ""
    let type: UIStateValueType = "single"
    if (value_strings.length <= 1) value = value_strings.join("")
    else
    {
        type = "multiple"
        value = value_strings.slice(0, 2).join(", ")
        if (value_strings.length > 2) value += `, (${value_strings.length - 2} more)`
    }

    return { value, type }
}


function run_tests ()
{
    console.log("running tests of get_probable_vap_set_display_values")

    const dt1 = new Date("2021-05-01 00:01")

    let wcomponent: WComponentNodeStateV2 = {
        id: "",
        created_at: dt1,
        type: "statev2",
        subtype: "other",
        title: "",
        description: "",
        values_and_prediction_sets: [],
    }
    let display_value


    const eternal_empty: StateValueAndPredictionsSet = {
        id: "", created_at: dt1, version: 1, datetime: {}, entries: []
    }
    const eternal_single: StateValueAndPredictionsSet = {
        id: "", created_at: dt1, version: 1, datetime: {}, entries: [
            { id: "vap1", value: "A", probability: 1, conviction: 1, description: "", explanation: "" },
        ]
    }
    const eternal_multiple: StateValueAndPredictionsSet = {
        id: "", created_at: dt1, version: 1, datetime: {}, entries: [
            { id: "vap1", value: "A", probability: 0.2, conviction: 1, description: "", explanation: "" },
            { id: "vap2", value: "B", probability: 0.8, conviction: 1, description: "", explanation: "" },
        ]
    }


    display_value = get_probable_vap_set_display_values(wcomponent, [])
    test(display_value, { value: undefined, type: "single" })

    display_value = get_probable_vap_set_display_values(wcomponent, [eternal_empty])
    test(display_value, { value: undefined, type: "single" })

    display_value = get_probable_vap_set_display_values(wcomponent, [eternal_single])
    test(display_value, { value: "A", type: "single" })

    display_value = get_probable_vap_set_display_values(wcomponent, [eternal_multiple])
    test(display_value, { value: "B, A", type: "multiple" })

    display_value = get_probable_vap_set_display_values(wcomponent, [eternal_single, eternal_single])
    test(display_value, { value: "A, A", type: "multiple" })

    display_value = get_probable_vap_set_display_values(wcomponent, [eternal_single, eternal_single, eternal_single])
    test(display_value, { value: "A, A, (1 more)", type: "multiple" })

    display_value = get_probable_vap_set_display_values(wcomponent, [eternal_multiple, eternal_multiple])
    test(display_value, { value: "B, B, (2 more)", type: "multiple" })
}

run_tests()
