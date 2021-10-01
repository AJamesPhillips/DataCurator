import type { CoreCounterfactualStateValueAndPredictionSetV2 } from "../wcomponent/interfaces/counterfactual"
import type { StateValueAndPredictionsSet } from "../wcomponent/interfaces/state"



export function clean_VAP_set_for_counterfactual (VAP_set: StateValueAndPredictionsSet, target_VAP_id: string | undefined): CoreCounterfactualStateValueAndPredictionSetV2
{
    const shared_entry_values = {
        ...VAP_set.shared_entry_values,
        conviction: 1,
    }


    if (target_VAP_id === undefined)
    {
        target_VAP_id = VAP_set.entries[0]?.id
    }


    const entries = VAP_set.entries.map(entry =>
    {
        const probability = entry.id === target_VAP_id ? 1 : 0
        return { ...entry, probability, relative_probability: 0, conviction: 1 }
    })


    return { ...VAP_set, shared_entry_values, entries, target_VAP_id }
}
