import type { StateValueAndPrediction } from "../../shared/models/interfaces/state"
import type { WComponentCounterfactual } from "../../shared/models/interfaces/uncertainty"
import type { VAP_id_counterfactual_map } from "../../state/derived/State"



export function merge_counterfactuals_into_VAPs (VAPs: StateValueAndPrediction[], VAP_counterfactuals_map?: VAP_id_counterfactual_map): StateValueAndPrediction[]
{
    if (!VAP_counterfactuals_map) return VAPs

    return VAPs.map(VAP =>
    {
        const counterfactual = VAP_counterfactuals_map[VAP.id]
        return merge_counterfactual_into_VAP(VAP, counterfactual)
    })
}



export function merge_counterfactual_into_VAP (VAP: StateValueAndPrediction, counterfactual?: WComponentCounterfactual): StateValueAndPrediction
{
    if (!counterfactual) return VAP

    const cf_probability = counterfactual && counterfactual.probability
    const cf_conviction = counterfactual && counterfactual.conviction

    const probability = cf_probability !== undefined ? cf_probability : VAP.probability
    const conviction = cf_conviction !== undefined ? cf_conviction : VAP.conviction

    return ({ ...VAP, probability, conviction })
}
