import {
    CounterfactualStateValueAndPrediction,
    merge_all_counterfactuals_into_all_VAPs,
} from "../../counterfactuals/merge"
import { test } from "../../utils/test"
import { WComponent, wcomponent_has_VAP_sets } from "../interfaces/SpecialisedObjects"
import type {
    WComponentNodeStateV2,
    UIStateValue,
    StateValueAndPredictionsSet,
    UIStateValueType,
    StateValueAndPrediction,
    UIStateValueModifer,
} from "../interfaces/state"
import type {
    TemporalUncertainty,
    VAP_id_counterfactual_map,
    VAP_set_id_counterfactual_map,
    WComponentCounterfactuals,
} from "../interfaces/uncertainty"
import { partition_and_prune_items_by_datetimes } from "../utils_datetime"
import { get_VAPs_ordered_by_prob } from "./utils"



const default_UI_state_value: UIStateValue = {
    value: undefined,
    probability: undefined,
    conviction: undefined,
    type: "single",
}



interface GetWcomponentStatev2ValueArgs
{
    wcomponent: WComponentNodeStateV2
    wc_counterfactuals: WComponentCounterfactuals | undefined
    created_at_ms: number
    sim_ms: number
}
export function get_wcomponent_statev2_value (args: GetWcomponentStatev2ValueArgs): UIStateValue
{
    const { wcomponent, wc_counterfactuals, created_at_ms, sim_ms } = args

    const { values_and_prediction_sets, subtype, boolean_true_str, boolean_false_str, } = wcomponent

    const VAPs_represents_boolean = subtype === "boolean"

    return get_VAP_set_value({
        values_and_prediction_sets,
        VAPs_represents_boolean,
        wc_counterfactuals,
        created_at_ms,
        sim_ms,
        boolean_true_str,
        boolean_false_str,
    })
}



interface GetWcomponentNonStatev2ValueArgs
{
    wcomponent: WComponent
    wc_counterfactuals: WComponentCounterfactuals | undefined
    created_at_ms: number
    sim_ms: number
}
export function get_wcomponent_non_statev2_value (args: GetWcomponentNonStatev2ValueArgs): UIStateValue
{
    const { wcomponent, wc_counterfactuals, created_at_ms, sim_ms } = args

    if (!wcomponent_has_VAP_sets(wcomponent)) return default_UI_state_value

    const { values_and_prediction_sets, } = wcomponent

    return get_VAP_set_value({
        values_and_prediction_sets,
        VAPs_represents_boolean: true,
        wc_counterfactuals,
        created_at_ms,
        sim_ms,
    })
}


interface GetVAPSetValueArgs
{
    values_and_prediction_sets: StateValueAndPredictionsSet[] | undefined
    VAPs_represents_boolean: boolean
    wc_counterfactuals: WComponentCounterfactuals | undefined
    created_at_ms: number
    sim_ms: number
    boolean_true_str?: string
    boolean_false_str?: string
}
function get_VAP_set_value (args: GetVAPSetValueArgs): UIStateValue
{
    const { values_and_prediction_sets, VAPs_represents_boolean, wc_counterfactuals,
        created_at_ms, sim_ms, boolean_true_str, boolean_false_str } = args

    const { present_items } = partition_and_prune_items_by_datetimes({
        items: values_and_prediction_sets || [], created_at_ms, sim_ms,
    })

    const all_VAPs = get_all_VAPs_from_VAP_sets(present_items, VAPs_represents_boolean)
    const VAP_counterfactuals_maps = Object.values(wc_counterfactuals && wc_counterfactuals.VAP_set || {})
    const counterfactual_VAPs = merge_all_counterfactuals_into_all_VAPs(all_VAPs, VAP_counterfactuals_maps)
    return get_probable_VAP_display_values(counterfactual_VAPs, VAPs_represents_boolean, boolean_true_str, boolean_false_str)
}



function get_probable_VAP_display_values (all_VAPs: CounterfactualStateValueAndPrediction[], VAPs_represents_boolean: boolean, boolean_true_str: string | undefined, boolean_false_str: string | undefined): UIStateValue
{
    if (!all_VAPs.length) return default_UI_state_value


    const VAPs_by_prob = get_VAPs_ordered_by_prob(all_VAPs, VAPs_represents_boolean)

    const subtype_specific_VAPs = VAPs_represents_boolean ? VAPs_by_prob : VAPs_by_prob.filter(VAP => VAP.probability > 0)
    const filtered_VAPs = subtype_specific_VAPs.filter(({ conviction }) => conviction !== 0)


    let value_strings: string[] = []
    if (VAPs_represents_boolean)
    {
        // Should we return something that's neither true nor false if probability === 0.5?
        value_strings = filtered_VAPs.map(VAP =>
        {
            return VAP.probability > 0.5
            ? (boolean_true_str || "True")
            : (boolean_false_str || "False")
        })
    }
    else
    {
        value_strings = filtered_VAPs.map(VAP => VAP.value)
    }


    let value: string | undefined
    let probability: number | undefined = undefined
    let conviction: number | undefined = undefined
    let type: UIStateValueType = "single"
    let modifier: UIStateValueModifer | undefined = undefined
    if (value_strings.length === 0)
    {
        value = undefined
    }
    else if (value_strings.length === 1)
    {
        value = value_strings.join("")
        const single_VAP = VAPs_by_prob[0]!
        if ((single_VAP.probability > 0 && single_VAP.probability < 1) || single_VAP.conviction !== 1)
        {
            modifier = "uncertain"
        }

        probability = single_VAP.probability
        conviction = single_VAP.conviction
    }
    else
    {
        type = "multiple"
        value = value_strings.slice(0, 2).join(", ")
        if (value_strings.length > 2) value += `, (${value_strings.length - 2} more)`
    }


    let cf = false
    VAPs_by_prob.forEach(VAP => cf = cf || VAP.is_counterfactual)
    if (cf) modifier = "assumed"


    return { value, probability, conviction, type, modifier }
}



function get_all_VAPs_from_VAP_sets (VAP_sets: StateValueAndPredictionsSet[], VAPs_represents_boolean: boolean)
{
    let all_VAPs: StateValueAndPrediction[] = []
    VAP_sets.forEach(VAP_set =>
    {
        const subtype_specific_VAPs = VAPs_represents_boolean
            ? VAP_set.entries.slice(0, 1)
            : VAP_set.entries

        all_VAPs = all_VAPs.concat(subtype_specific_VAPs)
    })

    return all_VAPs
}



function run_tests ()
{
    console. log("running tests of get_wcomponent_statev2_value")

    const dt0 = new Date("2021-05-01 00:00")
    const dt1 = new Date("2021-05-01 00:01")
    const dt2 = new Date("2021-05-01 00:02")


    interface CounterfactualData
    {
        probability?: number
    }


    function inflate_counterfactuals_data (counterfactuals_data: (CounterfactualData[][]) | undefined, VAP_sets_data: StateValueAndPrediction[][])
    {
        const counterfactuals_VAP_set_map: VAP_set_id_counterfactual_map = {}

        if (counterfactuals_data)
        {
            VAP_sets_data.forEach((VAPs, i) =>
            {
                const VAP_set_id = `vps${i}`

                const counter_factuals_VAP_map: VAP_id_counterfactual_map = {}
                VAPs.forEach((VAP, j) =>
                {
                    counter_factuals_VAP_map[VAP.id] = {
                        ...counterfactuals_data[i]![j],
                        id: "",
                        created_at: dt1,
                        type: "counterfactual",
                        title: "",
                        description: "",
                        target_wcomponent_id: "", // wcomponent.id,
                        target_VAP_set_id: VAP_set_id,
                        target_VAP_id: VAP.id,
                    }
                })
                counterfactuals_VAP_set_map[VAP_set_id] = counter_factuals_VAP_map
            })
        }

        const counterfactuals: WComponentCounterfactuals = { VAP_set: counterfactuals_VAP_set_map }
        return counterfactuals
    }


    function statev2_value (wcomponent: WComponentNodeStateV2, VAP_sets_data: StateValueAndPrediction[][], counterfactuals_data?: CounterfactualData[][], datetime: TemporalUncertainty={})
    {
        const values_and_prediction_sets: StateValueAndPredictionsSet[] = VAP_sets_data.map((VAPs, i) => ({
            id: `vps${i}`, created_at: dt1, version: 1, datetime, entries: VAPs
        }))
        wcomponent = { ...wcomponent, values_and_prediction_sets }


        const counterfactuals = inflate_counterfactuals_data(counterfactuals_data, VAP_sets_data)


        return get_wcomponent_statev2_value({
            wcomponent, wc_counterfactuals: counterfactuals, created_at_ms: dt1.getTime(), sim_ms: dt1.getTime(),
        })
    }


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


    display_value = statev2_value(wcomponent_other, [])
    test(display_value, { value: undefined, probability: undefined, conviction: undefined, type: "single" })

    display_value = statev2_value(wcomponent_other, [empty])
    test(display_value, { value: undefined, probability: undefined, conviction: undefined, type: "single" })

    display_value = statev2_value(wcomponent_other, [single])
    test(display_value, { value: "A100", probability: 1, conviction: 1, type: "single" })

    display_value = statev2_value(wcomponent_other, [multiple])
    test(display_value, { value: "A80, A20", probability: undefined, conviction: undefined, type: "multiple" })
    display_value = statev2_value(wcomponent_other, [multiple_with_1certain])
    test(display_value, { value: "A100", probability: 1, conviction: 1, type: "single" })

    display_value = statev2_value(wcomponent_other, [single, single])
    test(display_value, { value: "A100, A100", probability: undefined, conviction: undefined, type: "multiple" })

    display_value = statev2_value(wcomponent_other, [single, single, single])
    test(display_value, { value: "A100, A100, (1 more)", probability: undefined, conviction: undefined, type: "multiple" })

    display_value = statev2_value(wcomponent_other, [multiple, multiple])
    test(display_value, { value: "A80, A80, (2 more)", probability: undefined, conviction: undefined, type: "multiple" })

    // boolean

    display_value = statev2_value(wcomponent_boolean, [single])
    test(display_value, { value: "True", probability: 1, conviction: 1, type: "single" })

    display_value = statev2_value({ ...wcomponent_boolean, boolean_true_str: "Yes" }, [single])
    test(display_value, { value: "Yes", probability: 1, conviction: 1, type: "single" })

    // no chance

    display_value = statev2_value(wcomponent_other, [no_chance])
    test(display_value, { value: undefined, probability: undefined, conviction: undefined, type: "single" })

    // no chance boolean

    display_value = statev2_value(wcomponent_boolean, [no_chance])
    test(display_value, { value: "False", probability: 0, conviction: 1, type: "single" })

    display_value = statev2_value({ ...wcomponent_boolean, boolean_false_str: "No" }, [no_chance])
    test(display_value, { value: "No", probability: 0, conviction: 1, type: "single" })

    // uncertainty for "boolean" subtype

    display_value = statev2_value(wcomponent_boolean, [uncertain_prob])
    test(display_value, { value: "False", probability: 0.2, conviction: 1, type: "single", modifier: "uncertain" })

    display_value = statev2_value(wcomponent_boolean, [uncertain_cn])
    test(display_value, { value: "True", probability: 1, conviction: 0.5, type: "single", modifier: "uncertain" })

    display_value = statev2_value(wcomponent_boolean, [certain_no_cn])
    test(display_value, { value: undefined, probability: undefined, conviction: undefined, type: "single" })

    display_value = statev2_value(wcomponent_boolean, [single, certain_no_cn])
    test(display_value, { value: "True", probability: 1, conviction: 1, type: "single" })

    // uncertainty for "other" subtype

    display_value = statev2_value(wcomponent_other, [uncertain_prob])
    test(display_value, { value: "A20", probability: 0.2, conviction: 1, type: "single", modifier: "uncertain" })

    display_value = statev2_value(wcomponent_other, [uncertain_cn])
    test(display_value, { value: "A100c50", probability: 1, conviction: 0.5, type: "single", modifier: "uncertain" })

    display_value = statev2_value(wcomponent_other, [certain_no_cn])
    test(display_value, { value: undefined, probability: undefined, conviction: undefined, type: "single" })

    display_value = statev2_value(wcomponent_other, [single, certain_no_cn])
    test(display_value, { value: "A100", probability: 1, conviction: 1, type: "single" })

    // counterfactuals

    display_value = statev2_value(wcomponent_other, [single], [[{ probability: 0 }]])
    test(display_value, { value: undefined, probability: undefined, conviction: undefined, type: "single", modifier: "assumed" })

    // Single counterfactual with uncertainty
    display_value = statev2_value(wcomponent_other, [[vap_p80, vap_p20]], [[{ probability: 0 }, {}]])
    test(display_value, { value: "A20", probability: 0.2, conviction: 1, type: "single", modifier: "assumed" })

    // Counterfactuals to reverse option possibilities
    display_value = statev2_value(wcomponent_other, [[vap_p100, vap_p0]], [[{ probability: 0 }, { probability: 1 }]])
    test(display_value, { value: vap_p0.value, probability: 1, conviction: 1, type: "single", modifier: "assumed" })

    // Counterfactuals to invalidate all options
    display_value = statev2_value(wcomponent_other, [[vap_p100, vap_p0]], [[{ probability: 0 }, { probability: 0 }]])
    // might change this to probability: 0, conviction: 1, but needs more thought/examples first
    test(display_value, { value: undefined, probability: undefined, conviction: undefined, type: "single", modifier: "assumed" })

    // values before, at, after a datetime.min, datetime.value, datetime.max
    display_value = statev2_value(wcomponent_other, [[vap_p100]], undefined, { min: dt2 })
    test(display_value, { value: undefined, probability: undefined, conviction: undefined, type: "single" })
    display_value = statev2_value(wcomponent_other, [[vap_p100]], undefined, { min: dt1 })
    test(display_value, { value: "A100", probability: 1, conviction: 1, type: "single" })
    display_value = statev2_value(wcomponent_other, [[vap_p100]], undefined, { min: dt0 })
    test(display_value, { value: "A100", probability: 1, conviction: 1, type: "single" })

    display_value = statev2_value(wcomponent_other, [[vap_p100]], undefined, { value: dt2 })
    test(display_value, { value: undefined, probability: undefined, conviction: undefined, type: "single" })
    display_value = statev2_value(wcomponent_other, [[vap_p100]], undefined, { value: dt1 })
    test(display_value, { value: "A100", probability: 1, conviction: 1, type: "single" })
    display_value = statev2_value(wcomponent_other, [[vap_p100]], undefined, { value: dt0 })
    test(display_value, { value: undefined, probability: undefined, conviction: undefined, type: "single" })

    display_value = statev2_value(wcomponent_other, [[vap_p100]], undefined, { max: dt2 })
    test(display_value, { value: "A100", probability: 1, conviction: 1, type: "single" })
    display_value = statev2_value(wcomponent_other, [[vap_p100]], undefined, { max: dt1 })
    test(display_value, { value: undefined, probability: undefined, conviction: undefined, type: "single" })
    display_value = statev2_value(wcomponent_other, [[vap_p100]], undefined, { max: dt0 })
    test(display_value, { value: undefined, probability: undefined, conviction: undefined, type: "single" })
}

// run_tests()
