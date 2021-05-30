import type { CurrentValuePossibility, VAPsRepresent } from "./interfaces/generic_value"
import { WComponent, wcomponent_has_VAP_sets, wcomponent_is_statev1, wcomponent_is_statev2 } from "./interfaces/SpecialisedObjects"
import type { WComponentNodeState, WComponentNodeStateV2, WComponentStateV2SubType } from "./interfaces/state"
import type { WComponentCounterfactuals } from "./interfaces/uncertainty/uncertainty"
import { get_created_at_ms } from "./utils_datetime"
import { get_VAP_set_possible_values } from "./value_and_prediction/get_value"



interface GetWcomponentStateValueArgs
{
    wcomponent: WComponent
    wc_counterfactuals: WComponentCounterfactuals | undefined
    created_at_ms: number
    sim_ms: number
}
export function get_wcomponent_state_value (args: GetWcomponentStateValueArgs): CurrentValuePossibility[]
{
    const { wcomponent, wc_counterfactuals, created_at_ms, sim_ms } = args

    if (wcomponent_is_statev1(wcomponent)) return get_wcomponent_statev1_value(wcomponent, created_at_ms, sim_ms)
    if (wcomponent_is_statev2(wcomponent)) return get_wcomponent_statev2_value({ wcomponent, wc_counterfactuals, created_at_ms, sim_ms })
    else return []
}



function get_wcomponent_statev1_value (wcomponent: WComponentNodeState, created_at_ms: number, sim_ms: number): CurrentValuePossibility[]
{
    if (!wcomponent.values) return [] // TODO remove once MVP reached

    // .values are sorted created_at ascending
    const state_value_entry = wcomponent.values.filter(v => get_created_at_ms(v) <= created_at_ms).last()

    if (!state_value_entry) return []

    const possibility: CurrentValuePossibility = {
        value: state_value_entry.value,
        probability: 1,
        conviction: 1,
        uncertain: false,
        assumed: false,
    }

    return [possibility]
}



interface GetWcomponentStatev2ValueArgs
{
    wcomponent: WComponentNodeStateV2
    wc_counterfactuals: WComponentCounterfactuals | undefined
    created_at_ms: number
    sim_ms: number
}
export function get_wcomponent_statev2_value (args: GetWcomponentStatev2ValueArgs): CurrentValuePossibility[]
{
    const { wcomponent, wc_counterfactuals, created_at_ms, sim_ms } = args

    const VAPs_represent = subtype_to_VAPsRepresent(wcomponent.subtype)

    return get_VAP_set_possible_values({
        values_and_prediction_sets: wcomponent.values_and_prediction_sets,
        VAPs_represent,
        wc_counterfactuals,
        created_at_ms,
        sim_ms,
    })
}



export function subtype_to_VAPsRepresent (subtype: WComponentStateV2SubType): VAPsRepresent
{
    return subtype === "boolean" ? { boolean: true }
    : (subtype === "number" ? { number: true } : { other: true })
}
