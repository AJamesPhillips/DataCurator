import type { Base } from "../../shared/interfaces/base"
import type { HasVAPSetsAndMaybeValuePossibilities } from "./state"
import type { ValidityPredictions } from "../../shared/uncertainty/validity"
import { PlainCalculationObject } from "../../calculations/interfaces"



export type WComponentNodeType = "event" | "statev2" | "state_value" | "sub_state" | "multidimensional_state" | "process" | "action" | "actor" | "counterfactualv2" | "goal" | "judgement" | "objective" | "prioritisation"
export type WComponentConnectionType = "causal_link" | "relation_link"
export type WComponentType = WComponentNodeType | WComponentConnectionType
const _wcomponent_types: {[P in WComponentType]: true} = {
    event: true,
    statev2: true,
    state_value: true,
    sub_state: true,
    multidimensional_state: true,
    process: true,
    action: true,
    actor: true,
    causal_link: true,
    relation_link: true,
    judgement: true,
    objective: true,
    counterfactualv2: true,
    goal: true,
    prioritisation: true,
}
export const wcomponent_types: WComponentType[] = (Object.keys(_wcomponent_types) as any).sort()
    .filter((type: WComponentType) => type !== "multidimensional_state")



export interface WComponentBase extends Base
{
    type: WComponentType

    // Explainable
    title: string
    hide_title?: boolean
    hide_state?: boolean
    description: string
}


// TODO: Judgments are also nodes on the canvas so we should rename `WComponentNodeBase` to
// something else.
export interface WComponentNodeBase extends WComponentBase, Partial<ValidityPredictions>, Partial<HasVAPSetsAndMaybeValuePossibilities>
{
    type: WComponentNodeType
    // encompassed_by: string
}


export interface WComponentCalculations
{
    calculations: PlainCalculationObject[]
}
