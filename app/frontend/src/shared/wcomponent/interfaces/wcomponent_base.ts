import type { Base } from "./base"
import type { HasVAPSets } from "./state"
import type { ExistencePredictions } from "../../uncertainty/existence"
import type { ValidityPredictions } from "../../uncertainty/validity"



export type WComponentNodeType = "event" | "state" | "statev2" | "process" | "action" | "actor" | "counterfactual" | "counterfactualv2" | "goal"
export type WComponentConnectionType = "causal_link" | "relation_link"
export type WComponentType = WComponentNodeType | WComponentConnectionType | "judgement" | "objective" | "prioritisation"
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
    counterfactualv2: true,
    goal: true,
    prioritisation: true,
}
export const wcomponent_types: WComponentType[] = (Object.keys(_wcomponent_types) as any).sort()



export interface WComponentBase extends Base
{
    type: WComponentType

    // Explainable
    title: string
    hide_title?: boolean
    description: string
}


// TODO: Judgments are also nodes on the canvas so we should rename `WComponentNodeBase` to
// something else.
export interface WComponentNodeBase extends WComponentBase, Partial<ValidityPredictions>, Partial<ExistencePredictions>, Partial<HasVAPSets>
{
    type: WComponentNodeType
    // encompassed_by: string
}
