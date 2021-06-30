import type { CoreCounterfactualStateValueAndPredictionSetV2 } from "../wcomponent/interfaces/counterfactual"
import type { StateValueAndPredictionsSet } from "../wcomponent/interfaces/state"



export function clean_VAP_set_for_counterfactual (VAP_set: StateValueAndPredictionsSet): CoreCounterfactualStateValueAndPredictionSetV2
{
    const shared_entry_values = {
        ...VAP_set.shared_entry_values,
        conviction: 1,
    }


    const entries = VAP_set.entries.map(entry =>
    {
        return { ...entry, probability: 0, relative_probability: 0, conviction: 1 }
    })


    const first_entry = entries[0]
    let target_VAP_id: string | undefined = undefined
    if (first_entry)
    {
        first_entry.probability = 1
        target_VAP_id = first_entry.id
    }


    return { ...VAP_set, shared_entry_values, entries, target_VAP_id }
}
