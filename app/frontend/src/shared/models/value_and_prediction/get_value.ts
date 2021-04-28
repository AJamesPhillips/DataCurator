import type { WComponentNodeStateV2, UIStateValue } from "../interfaces/state"
import { get_created_at_ms, get_sim_datetime } from "../utils_datetime"



export function get_wcomponent_statev2_value (wcomponent: WComponentNodeStateV2, created_at_ms: number, sim_ms: number): UIStateValue
{
    return { value: "statev2", type: "single" }

    let vaps = wcomponent.values_and_prediction_sets.filter(v =>
    {
        if (get_created_at_ms(v) > created_at_ms) return false

        const sim_dt = get_sim_datetime(v)
        return sim_dt ? (sim_dt.getTime() <= sim_ms) : true
    })


    // const state_value_entry = wcomponent.values_and_prediction_sets.find_last(e => {
    //     const dt = get_sim_datetime(e)
    //     if (!dt) return false
    //     // TODO
    //     return true
    // })

    // if (!state_value_entry) return undefined

    // return state_value_entry.entries.sort((a, b) => a.probability > b.probability ? -1 : 1).first()?.value
}


