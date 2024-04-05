import type { StateValueAndPredictionsSet } from "./state"
import type { WComponentNodeBase } from "./wcomponent_base"



export interface TargetVAPIdCounterfactualInfoEntry
{
    counterfactual_v2_id: string | undefined
    counterfactual_has_knowledge_view: boolean | undefined
}

export interface TargetVAPIdCounterfactualInfoMap
{
    [target_VAP_id: string]: TargetVAPIdCounterfactualInfoEntry[]
}


export interface CounterfactualV2StateValueAndPredictionSetInfo
{
    has_any_counterfactual_applied: boolean
    active_counterfactual_v2_id: string | undefined
}
// This is a composed / denormalised form suitable for UI
export interface ComposedCounterfactualV2StateValueAndPredictionSet extends StateValueAndPredictionsSet, CounterfactualV2StateValueAndPredictionSetInfo {}



export interface WComponentCounterfactualV2 extends WComponentNodeBase
{
    type: "counterfactualv2"
    target_wcomponent_id?: string
    target_VAP_set_id?: string
    target_VAP_id?: string
    // counterfactual_VAP_set?: CoreCounterfactualStateValueAndPredictionSetV2
}
