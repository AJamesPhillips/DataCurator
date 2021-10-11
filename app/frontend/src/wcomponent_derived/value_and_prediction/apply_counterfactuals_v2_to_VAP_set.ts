import type { ComposedCounterfactualStateValueAndPredictionSetV2 } from "../../wcomponent/interfaces/counterfactual"
import type { StateValueAndPredictionsSet } from "../../wcomponent/interfaces/state"
import type { VAPSetIdToCounterfactualV2Map } from "../interfaces/counterfactual"



interface GetCounterfactualV2VAPSetArgs
{
    VAP_set: StateValueAndPredictionsSet
    VAP_set_id_to_counterfactual_v2_map: VAPSetIdToCounterfactualV2Map | undefined
}
export function apply_counterfactuals_v2_to_VAP_set (args: GetCounterfactualV2VAPSetArgs): ComposedCounterfactualStateValueAndPredictionSetV2
{
    const {
        VAP_set_id_to_counterfactual_v2_map,
    } = args
    let { VAP_set } = args


    const counterfactuals_v2 = VAP_set_id_to_counterfactual_v2_map?.[VAP_set.id] || []


    let has_any_counterfactual_applied = false
    let active_counterfactual_v2_id: string | undefined = undefined

    counterfactuals_v2.forEach(cf =>
    {
        const { target_VAP_id } = cf
        if (!target_VAP_id) return

        VAP_set = distort_VAP_set_for_counterfactual(VAP_set, target_VAP_id)
        has_any_counterfactual_applied = true
        active_counterfactual_v2_id = cf.id
    })

    return {
        ...VAP_set,
        has_any_counterfactual_applied,
        active_counterfactual_v2_id
    }
}



interface CoreCounterfactualStateValueAndPredictionSetV2 extends StateValueAndPredictionsSet
{
    target_VAP_id: string | undefined
}

function distort_VAP_set_for_counterfactual (VAP_set: StateValueAndPredictionsSet, target_VAP_id: string | undefined): CoreCounterfactualStateValueAndPredictionSetV2
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
