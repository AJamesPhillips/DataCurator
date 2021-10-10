import type { VAPSetIdToCounterfactualV2Map } from "../../wcomponent/interfaces/counterfactual"
import type { ComposedCounterfactualStateValueAndPredictionSetV2 } from "../../wcomponent/interfaces/counterfactual"
import type { StateValueAndPredictionsSet } from "../../wcomponent/interfaces/state"



interface GetCounterfactualV2VAPSetArgs
{
    VAP_set: StateValueAndPredictionsSet
    VAP_set_ids_to_counterfactuals_v2_map: VAPSetIdToCounterfactualV2Map | undefined
    active_counterfactual_v2_ids: string[] | undefined
}
export function get_counterfactual_v2_VAP_set (args: GetCounterfactualV2VAPSetArgs): ComposedCounterfactualStateValueAndPredictionSetV2
{
    const {
        VAP_set_ids_to_counterfactuals_v2_map,
        active_counterfactual_v2_ids = [],
    } = args
    let { VAP_set } = args


    const counterfactuals_v2 = VAP_set_ids_to_counterfactuals_v2_map?.[VAP_set.id] || []
    const active_cf_ids = new Set(active_counterfactual_v2_ids)


    let has_any_counterfactual_applied = false
    let active_counterfactual_v2_id: string | undefined = undefined

    counterfactuals_v2.forEach(cf =>
    {
        const { target_VAP_id } = cf
        if (!target_VAP_id) return

        if (active_cf_ids.has(cf.id) && !has_any_counterfactual_applied)
        {
            VAP_set = clean_VAP_set_for_counterfactual(VAP_set, target_VAP_id)
            has_any_counterfactual_applied = true
            active_counterfactual_v2_id = cf.id
        }
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

function clean_VAP_set_for_counterfactual (VAP_set: StateValueAndPredictionsSet, target_VAP_id: string | undefined): CoreCounterfactualStateValueAndPredictionSetV2
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
