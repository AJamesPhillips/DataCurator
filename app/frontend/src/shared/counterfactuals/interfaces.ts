import type { StateValueAndPrediction, StateValueAndPredictionsSet } from "../wcomponent/interfaces/state"



export interface CounterfactualStateValueAndPrediction extends StateValueAndPrediction
{
    is_counterfactual: boolean
}



export interface CounterfactualStateValueAndPredictionSetV2 extends StateValueAndPredictionsSet
{
    is_counterfactual: boolean
    counterfactual_v2_id: string
}
