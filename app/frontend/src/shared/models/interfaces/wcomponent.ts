import type { Base } from "./base"
import type { ExistencePredictions, ValidityPredictions } from "./uncertainty"



export type WComponentNodeType = "event" | "state" | "statev2" | "process" | "actor" | "counterfactual"
export type WComponentConnectionType = "causal_link" | "relation_link"
export type WComponentType = WComponentNodeType | WComponentConnectionType | "judgement"
const _wcomponent_types: {[P in WComponentType]: true} = {
    event: true,
    state: true,
    statev2: true,
    process: true,
    actor: true,
    causal_link: true,
    relation_link: true,
    judgement: true,
    counterfactual: true,
}
export const wcomponent_types: WComponentType[] = Object.keys(_wcomponent_types) as any



export interface WComponentBase extends Base
{
    type: WComponentType
    // previous_versions: WComponentID[] // could be formed from more than one previous WComponent
    // next_versions: WComponentID[] // more than one next WComponent could be formed from this

    // Explainable
    title: string
    description: string
}



export interface WComponentNodeBase extends WComponentBase, Partial<ValidityPredictions>, Partial<ExistencePredictions>
{
    type: WComponentNodeType
    // encompassed_by: string
}

