import { get_wcomponent_state_value } from "../../shared/wcomponent/get_wcomponent_state_value"
import type { WComponentJudgement } from "../../shared/wcomponent/interfaces/judgement"
import { WComponent, wcomponent_is_statev2 } from "../../shared/wcomponent/interfaces/SpecialisedObjects"
import type { WComponentCounterfactuals } from "../../shared/wcomponent/interfaces/uncertainty/uncertainty"



export type JudgementValue = boolean | undefined


interface CalculateJudgementValueArgs
{
    wcomponent: WComponentJudgement
    target_wcomponent: WComponent | undefined
    target_counterfactuals: WComponentCounterfactuals | undefined
    created_at_ms: number
    sim_ms: number
    // potential_world: PotentialWorld | undefined
}

export function calculate_judgement_value (args: CalculateJudgementValueArgs): JudgementValue
{
    const { wcomponent, target_wcomponent, target_counterfactuals, created_at_ms, sim_ms } = args

    if (!target_wcomponent) return undefined


    const possibilities = get_wcomponent_state_value({
        wcomponent: target_wcomponent,
        wc_counterfactuals: target_counterfactuals,
        created_at_ms,
        sim_ms,
    })


    if (possibilities.length !== 1) return undefined
    const current_value = possibilities[0]
    const value = current_value!.value

    const {
        judgement_operator: operator,
        judgement_comparator_value: comparator,
        judgement_manual: manual,
    } = wcomponent
    if (manual !== undefined) return manual


    const is_num = wcomponent_is_statev2(target_wcomponent) && target_wcomponent.subtype === "number"
    const coerced_comparator = is_num ? parseFloat(comparator || "") : comparator


    let result = undefined
    // purposefully using abstract equality comparison to accommodate strings, numbers etc
    if (operator === "==") result = value == coerced_comparator
    else if (operator === "!=") result = value != coerced_comparator
    else if (value === null) result = undefined
    else if (operator === "<") result = value < coerced_comparator
    else if (operator === "<=") result = value <= coerced_comparator
    else if (operator === ">") result = value > coerced_comparator
    else if (operator === ">=") result = value >= coerced_comparator

    return result
}
