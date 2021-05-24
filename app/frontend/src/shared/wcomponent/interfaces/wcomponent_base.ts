import type { Base } from "./base"
import type { HasVAPSets } from "./state"
import type { ExistencePredictions, ValidityPredictions } from "./uncertainty"



export type WComponentNodeType = "event" | "state" | "statev2" | "process" | "action" | "actor" | "counterfactual" | "goal"
export type WComponentConnectionType = "causal_link" | "relation_link"
export type WComponentType = WComponentNodeType | WComponentConnectionType | "judgement" | "objective"
const _wcomponent_types: {[P in WComponentType]: true} = {
    event: true,
    state: true,
    statev2: true,
    process: true,
    action: true,
    actor: true,
    causal_link: true,
    relation_link: true,
    judgement: true,
    objective: true,
    counterfactual: true,
    goal: true,
}
export const wcomponent_types: WComponentType[] = (Object.keys(_wcomponent_types) as any).sort()



export interface WComponentBase extends Base
{
    type: WComponentType

    // Explainable
    title: string
    description: string
}


// TODO: Judgments are also nodes on the canvas so we should rename `WComponentNodeBase` to
// something else.
export interface WComponentNodeBase extends WComponentBase, Partial<ValidityPredictions>, Partial<ExistencePredictions>, Partial<HasVAPSets>
{
    type: WComponentNodeType
    // encompassed_by: string
}

