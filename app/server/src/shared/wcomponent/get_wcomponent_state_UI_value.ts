import { percentage_to_string } from "../UI/percentages"
import { get_wcomponent_state_value } from "./get_wcomponent_state_value"
import type { CurrentValuePossibility, UIValue } from "./interfaces/generic_value"
import { WComponent, wcomponent_is_action, wcomponent_is_statev2 } from "./interfaces/SpecialisedObjects"
import type { WComponentCounterfactuals } from "./interfaces/uncertainty/uncertainty"



interface GetWcomponentStateUIValueArgs
{
    wcomponent: WComponent
    wc_counterfactuals: WComponentCounterfactuals | undefined
    created_at_ms: number
    sim_ms: number
}
export function get_wcomponent_state_UI_value (args: GetWcomponentStateUIValueArgs): UIValue
{
    const possibilities = get_wcomponent_state_value(args)
    const { wcomponent } = args

    const display_strings = get_display_strings(wcomponent, possibilities)


    let assumed = false
    let uncertain = false
    possibilities.forEach(possibility =>
    {
        assumed = assumed || possibility.assumed
        uncertain = uncertain || possibility.uncertain
    })


    return {
        ...display_strings,
        assumed,
        uncertain,
    }
}


function get_display_strings (wcomponent: WComponent, possibilities: CurrentValuePossibility[])
{
    const boolean_representation = get_boolean_representation(wcomponent)

    const value_strings: string[] = []
    const probability_strings: string[] = []
    const conviction_strings: string[] = []
    possibilities.forEach(({ value, probability, conviction }) =>
    {
        let value_string: string

        if (typeof value === "boolean")
        {
            value_string = value ? boolean_representation.true : boolean_representation.false
        }
        else value_string = `${value}`

        value_strings.push(value_string)

        probability_strings.push(percentage_to_string(probability))
        conviction_strings.push(percentage_to_string(conviction))
    })


    const is_defined = value_strings.length > 0


    let values_string = is_defined ? value_strings.slice(0, 2).join(", ") : "not defined"
    if (value_strings.length > 2) values_string += `, (${value_strings.length - 2} more)`

    let probabilities_string = probability_strings.length ? (probability_strings.slice(0, 2).join(", ") + "%") : ""
    if (probability_strings.length > 2) probabilities_string += `, (${probability_strings.length - 2} more)`

    let convictions_string = conviction_strings.length ? (conviction_strings.slice(0, 2).join(", ") + "%") : ""
    if (conviction_strings.length > 2) convictions_string += `, (${conviction_strings.length - 2} more)`


    return { is_defined, values_string, probabilities_string, convictions_string }
}



function get_boolean_representation (wcomponent: WComponent)
{
    let boolean_true_str = "True"
    let boolean_false_str = "False"
    if (wcomponent_is_statev2(wcomponent))
    {
        boolean_true_str = wcomponent.boolean_true_str || boolean_true_str
        boolean_false_str = wcomponent.boolean_false_str || boolean_false_str
    }
    else if (wcomponent_is_action(wcomponent))
    {
        boolean_true_str = "Completed"
        boolean_false_str = "Incomplete"
    }

    return { true: boolean_true_str, false: boolean_false_str }
}



// function run_tests ()
// {
//     console. log("running tests of get_wcomponent_statev2_value")

//     const dt0 = new Date("2021-05-01 00:00")
//     const dt1 = new Date("2021-05-01 00:01")
//     const dt2 = new Date("2021-05-01 00:02")


//     interface CounterfactualData
//     {
//         probability?: number
//     }


//     function inflate_counterfactuals_data (counterfactuals_data: (CounterfactualData[][]) | undefined, VAP_sets_data: StateValueAndPrediction[][])
//     {
//         const counterfactuals_VAP_set_map: VAP_set_id_counterfactual_map = {}

//         if (counterfactuals_data)
//         {
//             VAP_sets_data.forEach((VAPs, i) =>
//             {
//                 const VAP_set_id = `vps${i}`

//                 const counter_factuals_VAP_map: VAP_id_counterfactual_map = {}
//                 VAPs.forEach((VAP, j) =>
//                 {
//                     counter_factuals_VAP_map[VAP.id] = {
//                         ...counterfactuals_data[i]![j],
//                         id: "",
//                         created_at: dt1,
//                         type: "counterfactual",
//                         title: "",
//                         description: "",
//                         target_wcomponent_id: "", // wcomponent.id,
//                         target_VAP_set_id: VAP_set_id,
//                         target_VAP_id: VAP.id,
//                     }
//                 })
//                 counterfactuals_VAP_set_map[VAP_set_id] = counter_factuals_VAP_map
//             })
//         }

//         const counterfactuals: WComponentCounterfactuals = { VAP_set: counterfactuals_VAP_set_map }
//         return counterfactuals
//     }


//     function statev2_value (wcomponent: WComponentNodeStateV2, VAP_sets_data: StateValueAndPrediction[][], counterfactuals_data?: CounterfactualData[][], datetime: TemporalUncertainty={})
//     {
//         const values_and_prediction_sets: StateValueAndPredictionsSet[] = VAP_sets_data.map((VAPs, i) => ({
//             id: `vps${i}`, created_at: dt1, version: 1, datetime, entries: VAPs
//         }))
//         wcomponent = { ...wcomponent, values_and_prediction_sets }


//         const counterfactuals = inflate_counterfactuals_data(counterfactuals_data, VAP_sets_data)


//         return get_wcomponent_statev2_value({
//             wcomponent, wc_counterfactuals: counterfactuals, created_at_ms: dt1.getTime(), sim_ms: dt1.getTime(),
//         })
//     }


//     const wcomponent_other: WComponentNodeStateV2 = {
//         id: "",
//         created_at: dt1,
//         type: "statev2",
//         subtype: "other",
//         title: "",
//         description: "",
//         values_and_prediction_sets: [],
//     }
//     const wcomponent_boolean: WComponentNodeStateV2 = {
//         ...wcomponent_other,
//         subtype: "boolean",
//     }
//     let display_value


//     const VAP_defaults: StateValueAndPrediction = {
//         id: "VAP0", value: "", probability: 1, conviction: 1, description: "", explanation: ""
//     }


//     const vap_p100: StateValueAndPrediction = { ...VAP_defaults, id: "VAP100", value: "A100", probability: 1, conviction: 1 }
//     const vap_p80: StateValueAndPrediction = { ...vap_p100, id: "VAP80", value: "A80", probability: 0.8 }
//     const vap_p20: StateValueAndPrediction = { ...vap_p100, id: "VAP20", value: "A20", probability: 0.2 }
//     const vap_p0: StateValueAndPrediction = { ...vap_p100, id: "VAP0", value: "A0", probability: 0 }
//     const vap_p100c50: StateValueAndPrediction = { ...vap_p100, id: "VAP100c50", value: "A100c50", conviction: 0.5 }
//     const vap_p100c0: StateValueAndPrediction = { ...vap_p100, id: "VAP100c0", value: "A100c0", conviction: 0 }

//     const empty: StateValueAndPrediction[] = []
//     const single: StateValueAndPrediction[] = [vap_p100]
//     const multiple: StateValueAndPrediction[] = [vap_p20, vap_p80]
//     const multiple_with_1certain: StateValueAndPrediction[] = [vap_p100, vap_p0]
//     const no_chance: StateValueAndPrediction[] = [vap_p0]


//     const uncertain_prob: StateValueAndPrediction[] = [vap_p20]
//     const uncertain_cn: StateValueAndPrediction[] = [vap_p100c50]
//     const certain_no_cn: StateValueAndPrediction[] = [vap_p100c0]


//     display_value = statev2_value(wcomponent_other, [])
//     test(display_value, { value: undefined, probability: undefined, conviction: undefined, type: "single" })

//     display_value = statev2_value(wcomponent_other, [empty])
//     test(display_value, { value: undefined, probability: undefined, conviction: undefined, type: "single" })

//     display_value = statev2_value(wcomponent_other, [single])
//     test(display_value, { value: "A100", probability: 1, conviction: 1, type: "single" })

//     display_value = statev2_value(wcomponent_other, [multiple])
//     test(display_value, { value: "A80, A20", probability: undefined, conviction: undefined, type: "multiple" })
//     display_value = statev2_value(wcomponent_other, [multiple_with_1certain])
//     test(display_value, { value: "A100", probability: 1, conviction: 1, type: "single" })

//     display_value = statev2_value(wcomponent_other, [single, single])
//     test(display_value, { value: "A100, A100", probability: undefined, conviction: undefined, type: "multiple" })

//     display_value = statev2_value(wcomponent_other, [single, single, single])
//     test(display_value, { value: "A100, A100, (1 more)", probability: undefined, conviction: undefined, type: "multiple" })

//     display_value = statev2_value(wcomponent_other, [multiple, multiple])
//     test(display_value, { value: "A80, A80, (2 more)", probability: undefined, conviction: undefined, type: "multiple" })

//     // boolean

//     display_value = statev2_value(wcomponent_boolean, [single])
//     test(display_value, { value: "True", probability: 1, conviction: 1, type: "single" })

//     display_value = statev2_value({ ...wcomponent_boolean, boolean_true_str: "Yes" }, [single])
//     test(display_value, { value: "Yes", probability: 1, conviction: 1, type: "single" })

//     // no chance

//     display_value = statev2_value(wcomponent_other, [no_chance])
//     test(display_value, { value: undefined, probability: undefined, conviction: undefined, type: "single" })

//     // no chance boolean

//     display_value = statev2_value(wcomponent_boolean, [no_chance])
//     test(display_value, { value: "False", probability: 0, conviction: 1, type: "single" })

//     display_value = statev2_value({ ...wcomponent_boolean, boolean_false_str: "No" }, [no_chance])
//     test(display_value, { value: "No", probability: 0, conviction: 1, type: "single" })

//     // uncertainty for "boolean" subtype

//     display_value = statev2_value(wcomponent_boolean, [uncertain_prob])
//     test(display_value, { value: "False", probability: 0.2, conviction: 1, type: "single", modifier: "uncertain" })

//     display_value = statev2_value(wcomponent_boolean, [uncertain_cn])
//     test(display_value, { value: "True", probability: 1, conviction: 0.5, type: "single", modifier: "uncertain" })

//     display_value = statev2_value(wcomponent_boolean, [certain_no_cn])
//     test(display_value, { value: undefined, probability: undefined, conviction: undefined, type: "single" })

//     display_value = statev2_value(wcomponent_boolean, [single, certain_no_cn])
//     test(display_value, { value: "True", probability: 1, conviction: 1, type: "single" })

//     // uncertainty for "other" subtype

//     display_value = statev2_value(wcomponent_other, [uncertain_prob])
//     test(display_value, { value: "A20", probability: 0.2, conviction: 1, type: "single", modifier: "uncertain" })

//     display_value = statev2_value(wcomponent_other, [uncertain_cn])
//     test(display_value, { value: "A100c50", probability: 1, conviction: 0.5, type: "single", modifier: "uncertain" })

//     display_value = statev2_value(wcomponent_other, [certain_no_cn])
//     test(display_value, { value: undefined, probability: undefined, conviction: undefined, type: "single" })

//     display_value = statev2_value(wcomponent_other, [single, certain_no_cn])
//     test(display_value, { value: "A100", probability: 1, conviction: 1, type: "single" })

//     // counterfactuals

//     display_value = statev2_value(wcomponent_other, [single], [[{ probability: 0 }]])
//     test(display_value, { value: undefined, probability: undefined, conviction: undefined, type: "single", modifier: "assumed" })

//     // Single counterfactual with uncertainty
//     display_value = statev2_value(wcomponent_other, [[vap_p80, vap_p20]], [[{ probability: 0 }, {}]])
//     test(display_value, { value: "A20", probability: 0.2, conviction: 1, type: "single", modifier: "assumed" })

//     // Counterfactuals to reverse option possibilities
//     display_value = statev2_value(wcomponent_other, [[vap_p100, vap_p0]], [[{ probability: 0 }, { probability: 1 }]])
//     test(display_value, { value: vap_p0.value, probability: 1, conviction: 1, type: "single", modifier: "assumed" })

//     // Counterfactuals to invalidate all options
//     display_value = statev2_value(wcomponent_other, [[vap_p100, vap_p0]], [[{ probability: 0 }, { probability: 0 }]])
//     // might change this to probability: 0, conviction: 1, but needs more thought/examples first
//     test(display_value, { value: undefined, probability: undefined, conviction: undefined, type: "single", modifier: "assumed" })

//     // values before, at, after a datetime.min, datetime.value, datetime.max
//     display_value = statev2_value(wcomponent_other, [[vap_p100]], undefined, { min: dt2 })
//     test(display_value, { value: undefined, probability: undefined, conviction: undefined, type: "single" })
//     display_value = statev2_value(wcomponent_other, [[vap_p100]], undefined, { min: dt1 })
//     test(display_value, { value: "A100", probability: 1, conviction: 1, type: "single" })
//     display_value = statev2_value(wcomponent_other, [[vap_p100]], undefined, { min: dt0 })
//     test(display_value, { value: "A100", probability: 1, conviction: 1, type: "single" })

//     display_value = statev2_value(wcomponent_other, [[vap_p100]], undefined, { value: dt2 })
//     test(display_value, { value: undefined, probability: undefined, conviction: undefined, type: "single" })
//     display_value = statev2_value(wcomponent_other, [[vap_p100]], undefined, { value: dt1 })
//     test(display_value, { value: "A100", probability: 1, conviction: 1, type: "single" })
//     display_value = statev2_value(wcomponent_other, [[vap_p100]], undefined, { value: dt0 })
//     test(display_value, { value: undefined, probability: undefined, conviction: undefined, type: "single" })

//     display_value = statev2_value(wcomponent_other, [[vap_p100]], undefined, { max: dt2 })
//     test(display_value, { value: "A100", probability: 1, conviction: 1, type: "single" })
//     display_value = statev2_value(wcomponent_other, [[vap_p100]], undefined, { max: dt1 })
//     test(display_value, { value: undefined, probability: undefined, conviction: undefined, type: "single" })
//     display_value = statev2_value(wcomponent_other, [[vap_p100]], undefined, { max: dt0 })
//     test(display_value, { value: undefined, probability: undefined, conviction: undefined, type: "single" })
// }

// // run_tests()
