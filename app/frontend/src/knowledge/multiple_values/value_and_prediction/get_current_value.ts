import type { StateValueAndPredictionsSet } from "../../../shared/wcomponent/interfaces/state"



export function get_current_value_of_VAP_set (VAP_set: StateValueAndPredictionsSet): string | undefined
{
    let status: string | undefined = undefined

    const conviction = VAP_set.shared_entry_values?.conviction || 0
    const probability = VAP_set.shared_entry_values?.probability || 0

    VAP_set.entries.forEach(VAP =>
    {
        if (Math.max(conviction, VAP.conviction) !== 1) return
        if (Math.max(probability, VAP.probability) !== 1) return
        status = VAP.value
    })

    return status
}
