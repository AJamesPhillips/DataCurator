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



export interface WComponentCounterfactualV2 extends WComponentNodeBase
{
    type: "counterfactualv2"
    target_wcomponent_id: string
    // subtype: "existence" | "validity"
    target_VAP_set_id: string
    VAP_set: StateValueAndPredictionsSet
}
