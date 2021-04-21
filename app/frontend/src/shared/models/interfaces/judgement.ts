import type { WComponentBase } from "./SpecialisedObjects"



export interface WComponentJudgement extends WComponentBase
{
    type: "judgement"
    judgement_target_wcomponent_id: string
    judgement_operator: JudgementOperator
    judgement_comparator_value: string
    judgement_manual?: boolean
    // judgements: Judgement[]
}
type JudgementOperator = "==" | "!=" | "<" | "<=" | ">" | ">="
const _judgement_operators: {[P in JudgementOperator]: true} = {
    "==": true,
    "!=": true,
    "<": true,
    "<=": true,
    ">": true,
    ">=": true,
}
export const judgement_operators: JudgementOperator[] = Object.keys(_judgement_operators) as any
