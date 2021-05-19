import { WComponent, wcomponent_is_statev1, wcomponent_is_statev2 } from "./interfaces/SpecialisedObjects"
import type { UIStateValue, WComponentNodeState } from "./interfaces/state"
import type { WComponentCounterfactuals } from "./interfaces/uncertainty"
import { get_created_at_ms } from "./utils_datetime"
import { get_wcomponent_statev2_value } from "./value_and_prediction/get_value"



const default_value: UIStateValue = { value: undefined, type: "single" }


interface GetWcomponentStateValueArgs
{
    wcomponent: WComponent
    wc_counterfactuals: WComponentCounterfactuals | undefined
    created_at_ms: number
    sim_ms: number
}
export function get_wcomponent_state_value (args: GetWcomponentStateValueArgs): UIStateValue
{
    const { wcomponent, wc_counterfactuals, created_at_ms, sim_ms } = args

    if (wcomponent_is_statev1(wcomponent)) return get_wcomponent_statev1_value(wcomponent, created_at_ms, sim_ms)
    if (wcomponent_is_statev2(wcomponent)) return get_wcomponent_statev2_value({ wcomponent, wc_counterfactuals, created_at_ms, sim_ms })

    return default_value
}


function get_wcomponent_statev1_value (wcomponent: WComponentNodeState, created_at_ms: number, sim_ms: number): UIStateValue
{
    if (!wcomponent.values) return default_value // TODO remove once MVP reached

    // .values are sorted created_at ascending
    const state_value_entry = wcomponent.values.filter(v => get_created_at_ms(v) <= created_at_ms).last()

    if (!state_value_entry) return default_value

    return { value: state_value_entry.value, type: "single" }
}
