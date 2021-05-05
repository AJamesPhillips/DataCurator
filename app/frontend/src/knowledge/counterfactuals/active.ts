import type { WComponentCounterfactual } from "../../shared/models/interfaces/uncertainty"



export function is_counterfactual_active (counterfactual?: WComponentCounterfactual): boolean
{
    const cf_probability = counterfactual && counterfactual.probability
    const cf_conviction = counterfactual && counterfactual.conviction

    return cf_probability !== undefined || cf_conviction !== undefined
}
