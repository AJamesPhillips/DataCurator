import type { StateValueAndPrediction } from "../wcomponent/interfaces/state"
import type { VAP_id_counterfactual_map } from "../uncertainty/uncertainty"
import type { WComponentCounterfactual } from "../wcomponent/interfaces/counterfactual"



export interface CounterfactualStateValueAndPrediction extends StateValueAndPrediction
{
    is_counterfactual: boolean
}


export function merge_counterfactual_into_VAP (VAP: StateValueAndPrediction, counterfactual?: WComponentCounterfactual): CounterfactualStateValueAndPrediction
{
    if (!counterfactual) return { ...VAP, is_counterfactual: false }

    const cf_probability = counterfactual && counterfactual.probability
    const cf_conviction = counterfactual && counterfactual.conviction

    const probability = cf_probability !== undefined ? cf_probability : VAP.probability
    const conviction = cf_conviction !== undefined ? cf_conviction : VAP.conviction
    const cf = cf_probability !== undefined || cf_conviction !== undefined

    return ({ ...VAP, probability, conviction, is_counterfactual: cf })
}


export function merge_counterfactuals_into_VAPs (VAPs: StateValueAndPrediction[], VAP_counterfactuals_map?: VAP_id_counterfactual_map): CounterfactualStateValueAndPrediction[]
{
    return VAPs.map(VAP =>
    {
        const counterfactual = VAP_counterfactuals_map && VAP_counterfactuals_map[VAP.id]
        return merge_counterfactual_into_VAP(VAP, counterfactual)
    })
}



export function merge_all_counterfactuals_into_all_VAPs (all_VAPs: StateValueAndPrediction[], VAP_counterfactuals_maps: VAP_id_counterfactual_map[])
{
    const one_map: VAP_id_counterfactual_map = Object.assign({}, ...VAP_counterfactuals_maps)

    return merge_counterfactuals_into_VAPs(all_VAPs, one_map)
}
