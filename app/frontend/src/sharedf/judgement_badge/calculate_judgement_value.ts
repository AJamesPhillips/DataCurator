import type { WComponentJudgement } from "../../wcomponent/interfaces/judgement"
import type { WComponent } from "../../wcomponent/interfaces/SpecialisedObjects"
import { get_wcomponent_VAPs_represent } from "../../wcomponent/value_and_prediction/utils"
import { ParsedValue, VAPsType } from "../../wcomponent/interfaces/value_probabilities_etc"
import type { VAPSetIdToCounterfactualV2Map } from "../../wcomponent/interfaces/counterfactual"
import { get_wcomponent_state_value_and_probabilities } from "../../wcomponent/value_and_prediction/get_value"



export type JudgementValue = boolean | undefined


interface CalculateJudgementValueArgs
{
    judgement_wcomponent: WComponentJudgement
    target_wcomponent: WComponent | undefined
    target_counterfactuals: VAPSetIdToCounterfactualV2Map | undefined
    created_at_ms: number
    sim_ms: number
    // potential_world: PotentialWorld | undefined
}

export function calculate_judgement_value (args: CalculateJudgementValueArgs): JudgementValue
{
    const { judgement_wcomponent, target_wcomponent, target_counterfactuals, created_at_ms, sim_ms } = args

    if (!target_wcomponent) return undefined

    const possibilities = get_wcomponent_state_value_and_probabilities({
        wcomponent: target_wcomponent,
        wc_counterfactuals: target_counterfactuals,
        created_at_ms,
        sim_ms,
    })


    if (possibilities.length !== 1)
    {
        // TODO perhaps if multiple values we will want to check if all the values are the same
        // (and probabilities >0.5) and then we can form a judgement based on all of these
        return undefined
    }
    const current_value = possibilities[0]!
    const value = current_value.value


    const target_VAPs_represent = get_wcomponent_VAPs_represent(target_wcomponent)

    return core_calculate_judgement_value({ judgement_wcomponent, target_VAPs_represent, value })
}



interface CoreCalculateJudgementValueArgs
{
    judgement_wcomponent: WComponentJudgement
    target_VAPs_represent: VAPsType
    value: ParsedValue
}
export function core_calculate_judgement_value (args: CoreCalculateJudgementValueArgs)
{
    const { judgement_wcomponent, target_VAPs_represent, value } = args

    const {
        judgement_operator: operator,
        judgement_comparator_value: comparator,
        judgement_manual: manual,
    } = judgement_wcomponent
    if (manual !== undefined) return manual


    const coerced_comparator = target_VAPs_represent === VAPsType.number
        ? parseFloat(comparator || "")
        : (target_VAPs_represent === VAPsType.boolean
            ? (comparator === "True" || (comparator === "False" ? false : undefined))
            : comparator)


    let result = undefined
    if (value === null || coerced_comparator === undefined) result = undefined
    else if (operator === "==") result = value === coerced_comparator
    else if (operator === "!=") result = value !== coerced_comparator
    else if (operator === "<") result = value < coerced_comparator
    else if (operator === "<=") result = value <= coerced_comparator
    else if (operator === ">") result = value > coerced_comparator
    else if (operator === ">=") result = value >= coerced_comparator

    return result
}
