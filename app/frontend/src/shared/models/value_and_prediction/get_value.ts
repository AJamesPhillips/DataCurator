import type { WComponentNodeStateV2, UIStateValue } from "../interfaces/state"
import { get_created_at_ms, get_sim_datetime,  } from "../utils_datetime"



export function get_wcomponent_statev2_value (wcomponent: WComponentNodeStateV2, created_at_ms: number, sim_ms: number): UIStateValue
{
    return { value: "statev2", type: "single" }

    // const { past_items, future_items } = partition_items_by_datetimes({
    //     items: wcomponent.values_and_prediction_sets, created_at_ms, sim_ms
    // })

    // past_items, future_items



    // const state_value_entry = wcomponent.values_and_prediction_sets.find_last(e => {
    //     const dt = get_sim_datetime(e)
    //     if (!dt) return false
    //     // TODO
    //     return true
    // })

    // if (!state_value_entry) return undefined

    // return state_value_entry.entries.sort((a, b) => a.probability > b.probability ? -1 : 1).first()?.value
}


