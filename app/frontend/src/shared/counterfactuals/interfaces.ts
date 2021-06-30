import type { StateValueAndPrediction, StateValueAndPredictionsSet } from "../wcomponent/interfaces/state"



export interface CounterfactualStateValueAndPrediction extends StateValueAndPrediction
{
    is_counterfactual: boolean
}



export interface CounterfactualStateValueAndPredictionSetV2 extends StateValueAndPredictionsSet
{
    is_counterfactual: boolean
    active_counterfactual_v2_id: string | undefined
    active_counterfactual_has_knowledge_view: boolean | undefined
}
