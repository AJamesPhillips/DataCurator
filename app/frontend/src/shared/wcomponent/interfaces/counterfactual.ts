import type { StateValueAndPredictionsSet } from "./state"
import type { WComponentNodeBase } from "./wcomponent_base"



export interface WComponentCounterfactual extends WComponentNodeBase
{
    type: "counterfactual"
    target_wcomponent_id: string
    // subtype: "existence" | "validity"
    target_VAP_set_id: string
    target_VAP_id: string
    probability?: number
    conviction?: number
}



// The v1 interface is at the VAP level and is: ComposedCounterfactualStateValueAndPredictionV1
// This is composed / denormalised form suitable for UI
export interface ComposedCounterfactualStateValueAndPredictionSetV2 extends StateValueAndPredictionsSet
{
    is_counterfactual: boolean
    active_target_VAP_id: string | undefined
    active_counterfactual_v2_id: string | undefined
    active_counterfactual_has_knowledge_view: boolean | undefined
}


export interface CoreCounterfactualStateValueAndPredictionSetV2 extends StateValueAndPredictionsSet
{
    target_VAP_id: string | undefined
}



export interface WComponentCounterfactualV2 extends WComponentNodeBase
{
    type: "counterfactualv2"
    target_wcomponent_id?: string
    // subtype: "existence" | "validity"
    target_VAP_set_id?: string
    counterfactual_VAP_set?: CoreCounterfactualStateValueAndPredictionSetV2
}
