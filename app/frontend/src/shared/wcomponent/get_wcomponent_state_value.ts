import type { WComponentCounterfactuals } from "../uncertainty/uncertainty"
import { CurrentValueAndProbabilities, VAPsType } from "./interfaces/generic_value"
import {
    WComponent,
    wcomponent_is_action,
    wcomponent_is_statev1,
    wcomponent_is_statev2,
    wcomponent_should_have_state_VAP_sets,
} from "./interfaces/SpecialisedObjects"
import type { WComponentNodeState } from "./interfaces/state"
import { get_created_at_ms } from "../utils_datetime/utils_datetime"
import { get_current_values_and_probabilities } from "./value_and_prediction/get_value"
import { subtype_to_VAPsType } from "./value_and_prediction/utils"



export function get_wcomponent_VAPsType (wcomponent: WComponent)
{
    const VAPs_represent = wcomponent_is_statev2(wcomponent) ? subtype_to_VAPsType(wcomponent.subtype)
        : (wcomponent_is_action(wcomponent) ? VAPsType.action
        : VAPsType.other)

    return VAPs_represent
}


interface GetWcomponentStateValueArgs
{
    wcomponent: WComponent
    wc_counterfactuals: WComponentCounterfactuals | undefined
    created_at_ms: number
    sim_ms: number
}
export function get_wcomponent_state_value (args: GetWcomponentStateValueArgs): CurrentValueAndProbabilities[]
{
    const { wcomponent, wc_counterfactuals, created_at_ms, sim_ms } = args

    if (wcomponent_is_statev1(wcomponent)) return get_wcomponent_statev1_value(wcomponent, created_at_ms, sim_ms)
    else if (wcomponent_should_have_state_VAP_sets(wcomponent))
    {
        const VAPs_represent = get_wcomponent_VAPsType(wcomponent)

        return get_current_values_and_probabilities({
            values_and_prediction_sets: wcomponent.values_and_prediction_sets,
            VAPs_represent,
            wc_counterfactuals,
            created_at_ms,
            sim_ms,
        })
    }
    else return []
}



function get_wcomponent_statev1_value (wcomponent: WComponentNodeState, created_at_ms: number, sim_ms: number): CurrentValueAndProbabilities[]
{
    if (!wcomponent.values) return [] // TODO remove once MVP reached

    // .values are sorted created_at ascending
    const state_value_entry = wcomponent.values.filter(v => get_created_at_ms(v) <= created_at_ms).last()

    if (!state_value_entry) return []

    const possibility: CurrentValueAndProbabilities = {
        value: state_value_entry.value,
        probability: 1,
        conviction: 1,
        certainty: 1,
        uncertain: false,
        assumed: false,
    }

    return [possibility]
}
