import {
    ComposedCounterfactualStateValueAndPredictionV1,
    merge_all_counterfactuals_into_all_VAPs,
} from "../../counterfactuals/merge"
import { CurrentValue, CurrentValueAndProbabilities, VAPsType } from "../interfaces/generic_value"
import type {
    StateValueAndPredictionsSet,
    StateValueAndPrediction,
} from "../interfaces/state"
import type {
    WComponentCounterfactuals,
} from "../../uncertainty/uncertainty"
import { calc_is_uncertain } from "../uncertainty_utils"
import { partition_and_prune_items_by_datetimes } from "../utils_datetime"
import { get_VAPs_ordered_by_prob } from "./utils"



export function get_current_value (probabilities: CurrentValueAndProbabilities[]): CurrentValue
{
    let value: CurrentValue = {
        probabilities,
        is_defined: probabilities.length > 0,
        value: undefined,
        probability: 1,
        conviction: 1,
        certainty: 1,
        uncertain: probabilities.length > 1,
        assumed: false,
    }

    if (probabilities.length === 1)
    {
        value = { ...value, ...probabilities[0], probabilities }
    }

    return value
}



interface GetCurrentValueAndProbabilitiesArgs
{
    values_and_prediction_sets: StateValueAndPredictionsSet[] | undefined
    VAPs_represent: VAPsType
    wc_counterfactuals: WComponentCounterfactuals | undefined
    created_at_ms: number
    sim_ms: number
}
export function get_current_values_and_probabilities (args: GetCurrentValueAndProbabilitiesArgs): CurrentValueAndProbabilities[]
{
    const counterfactual_VAPs = get_current_counterfactual_VAP_sets(args)
    return get_probable_VAP_values(counterfactual_VAPs, args.VAPs_represent)
}



interface GetCurrentCounterfactualVAPSetsArgs
{
    values_and_prediction_sets: StateValueAndPredictionsSet[] | undefined
    VAPs_represent: VAPsType
    wc_counterfactuals: WComponentCounterfactuals | undefined
    created_at_ms: number
    sim_ms: number
}
function get_current_counterfactual_VAP_sets (args: GetCurrentCounterfactualVAPSetsArgs): ComposedCounterfactualStateValueAndPredictionV1[]
{
    const { values_and_prediction_sets, VAPs_represent, wc_counterfactuals,
        created_at_ms, sim_ms } = args

    const { present_items } = partition_and_prune_items_by_datetimes({
        items: values_and_prediction_sets || [], created_at_ms, sim_ms,
    })

    const all_present_VAPs = get_all_VAPs_from_VAP_sets(present_items, VAPs_represent)
    const VAP_counterfactuals_maps = Object.values(wc_counterfactuals && wc_counterfactuals.VAP_set || {})
    return merge_all_counterfactuals_into_all_VAPs(all_present_VAPs, VAP_counterfactuals_maps)
}



export function clean_VAP_set_entries (VAP_set: StateValueAndPredictionsSet, VAPs_represent: VAPsType)
{
    const subtype_specific_VAPs = VAPs_represent === VAPsType.boolean
        ? VAP_set.entries.slice(0, 1)
        : VAP_set.entries

    return { ...VAP_set, entries: subtype_specific_VAPs }
}



function get_all_VAPs_from_VAP_sets (VAP_sets: StateValueAndPredictionsSet[], VAPs_represent: VAPsType)
{
    let all_VAPs: StateValueAndPrediction[] = []
    VAP_sets.forEach(VAP_set =>
    {
        const subtype_specific_VAPs = clean_VAP_set_entries(VAP_set, VAPs_represent).entries
        all_VAPs = all_VAPs.concat(subtype_specific_VAPs)
    })

    return all_VAPs
}



export function parse_VAP_value (VAP: StateValueAndPrediction, VAPs_represent: VAPsType)
{
    // TODO: When boolean, should we return something that's neither true nor false if probability === 0.5?
    const value = VAPs_represent === VAPsType.boolean ? VAP.probability > 0.5
        : (VAPs_represent === VAPsType.number ? parseFloat(VAP.value)
        : VAP.value)

    return value
}



function get_probable_VAP_values (all_VAPs: ComposedCounterfactualStateValueAndPredictionV1[], VAPs_represent: VAPsType): CurrentValueAndProbabilities[]
{
    if (!all_VAPs.length) return []


    const VAPs_by_prob = get_VAPs_ordered_by_prob(all_VAPs, VAPs_represent)


    const possibilities: CurrentValueAndProbabilities[] = VAPs_by_prob.map(VAP =>
    {
        const value = parse_VAP_value(VAP, VAPs_represent)
        const certainty = Math.min(VAP.probability, VAP.conviction)

        return {
            ...VAP,
            certainty,
            uncertain: calc_is_uncertain(VAP),
            assumed: VAP.is_counterfactual,
            value,
        }
    })
    .filter(possibility =>
    {
        return VAPs_represent === VAPsType.boolean || possibility.uncertain || possibility.probability > 0
    })

    return possibilities
}



/*

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
*/