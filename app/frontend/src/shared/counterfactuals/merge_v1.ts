import type { StateValueAndPrediction } from "../wcomponent/interfaces/state"



export interface ComposedCounterfactualStateValueAndPredictionV1 extends StateValueAndPrediction
{
    is_counterfactual: false
}
