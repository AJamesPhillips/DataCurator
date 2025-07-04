import { CustomUnit } from "simulation"

import { PlainCalculationObject } from "../../calculations/interfaces"
import type { Base } from "../../shared/interfaces/base"
import type { HasVAPSetsAndMaybeValuePossibilities } from "./state"



export type WComponentNodeType = "event" | "statev2" | "state_value" | "multidimensional_state" | "process" | "action" | "actor" | "counterfactualv2"
export type WComponentConnectionType = "causal_link" | "relation_link"
export type WComponentType = WComponentNodeType | WComponentConnectionType
const _wcomponent_types: {[P in WComponentType]: true} = {
    event: true,
    statev2: true,
    state_value: true,
    multidimensional_state: true,
    process: true,
    action: true,
    actor: true,
    causal_link: true,
    relation_link: true,
    counterfactualv2: true,
}
export const wcomponent_types: WComponentType[] = (Object.keys(_wcomponent_types) as WComponentType[])
    .sort()
    .filter((type: WComponentType) => type !== "multidimensional_state")
export const wcomponent_types_set: Set<WComponentType> = new Set(wcomponent_types)


export interface WComponentBase extends Base
{
    type: WComponentType

    title: string
    hide_title?: boolean
    hide_state?: boolean
    description: string
}


// TODO: Judgments are also nodes on the canvas so we should rename `WComponentNodeBase` to
// something else.
export interface WComponentNodeBase extends WComponentBase, Partial<HasVAPSetsAndMaybeValuePossibilities>
{
    type: WComponentNodeType
    // encompassed_by: string
}


export interface CalculationCustomUnit extends CustomUnit
{
    // The value for this can be reused so does not guarantee it will remain
    // unique across time, but at any one time it should be unique.
    id: number
}
export interface WComponentCalculations
{
    calculations: PlainCalculationObject[]
    calculation_custom_units?: CalculationCustomUnit[]
}
