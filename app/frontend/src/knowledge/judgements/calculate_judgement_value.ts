import { get_wcomponent_state_value } from "../../shared/models/get_wcomponent_state_value"
import type { WComponentJudgement } from "../../shared/models/interfaces/judgement"
import type { WComponent } from "../../shared/models/interfaces/SpecialisedObjects"



export type JudgementValue = boolean | undefined


interface CalculateJudgementValueArgs
{
    wcomponent: WComponentJudgement
    target_wcomponent: WComponent | undefined
    created_at_ms: number
    sim_ms: number
    // potential_world: PotentialWorld | undefined
}

export function calculate_judgement_value (args: CalculateJudgementValueArgs): JudgementValue
{
    const { wcomponent, target_wcomponent, created_at_ms, sim_ms } = args

    if (!target_wcomponent) return undefined

    const { value } = get_wcomponent_state_value(target_wcomponent, created_at_ms, sim_ms)
    if (value === undefined) return undefined

    const {
        judgement_operator: operator,
        judgement_comparator_value: comparator,
        judgement_manual: manual,
    } = wcomponent

    if (manual !== undefined) return manual

    let result = undefined
    // purposefully using abstract equality comparison to accommodate strings, numbers etc
    if (operator === "==") result = value == comparator
    else if (operator === "!=") result = value != comparator
    else if (value === null) result = undefined
    else if (operator === "<") result = value < comparator
    else if (operator === "<=") result = value <= comparator
    else if (operator === ">") result = value > comparator
    else if (operator === ">=") result = value >= comparator

    return result
}
