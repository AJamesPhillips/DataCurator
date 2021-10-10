import type { WComponentBase } from "./wcomponent_base"



// ++ 2021-05-24
// Objective(s) are Judgement(s) with the potential for action
//
// That an Objective(s) has "potential for action" is not saying you will do actions
// to fulfil that objective as all objectives can be `potential` or `abandoned (rejected)`
// meaning it is not being actively pursued, as well as `active`, `completed`.
//
// But Objective(s) do allow you to clearly specify what you want to see the world
// be like and why.  Both of these are given from the judgement they inherent from.
//
// So perhaps Judgements == Objectives in the current version of the app.
// -- 2021-05-24

export interface WComponentJudgement extends WComponentBase
{
    type: "judgement" | "objective"
    judgement_target_wcomponent_id: string
    judgement_operator: JudgementOperator
    judgement_comparator_value: string
    judgement_manual?: boolean
    // judgements: Judgement[]
    // degree: "borderline" | "minor" | "moderate" | "significant" | "extreme"
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
