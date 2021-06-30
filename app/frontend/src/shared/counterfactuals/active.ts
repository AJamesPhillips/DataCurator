import type { WComponentCounterfactual } from "../wcomponent/interfaces/counterfactual"



export function is_counterfactual_active (counterfactual?: WComponentCounterfactual): boolean
{
    const cf_probability = counterfactual && counterfactual.probability
    const cf_conviction = counterfactual && counterfactual.conviction

    return cf_probability !== undefined || cf_conviction !== undefined
}
