import type { StateValueAndPrediction as VAP } from "../interfaces/state"
import { VAPsType } from "../interfaces/VAPsType"
import type { ParsedValue } from "../../wcomponent_derived/interfaces/value"



// Do NOT change these otherwise you will break people's existing data
export enum ACTION_VALUE_POSSIBILITY_ID {
    action_potential = "action__value_possibility__potential_id",
    action_in_progress = "action__value_possibility__in_progress_id",
    action_paused = "action__value_possibility__paused_id",
    action_completed = "action__value_possibility__completed_id",
    action_failed = "action__value_possibility__failed_id",
    action_rejected = "action__value_possibility__rejected_id",
}

// Do NOT change these otherwise you will break people's existing data
export const VALUE_POSSIBILITY_IDS = {
    uncertainty: "value_possibility_uncertainty_id__undefined__",

    boolean_true: "value_possibility_true_id",
    boolean_false: "value_possibility_false_id",

    ...ACTION_VALUE_POSSIBILITY_ID,
}



export const ORDERED_ACTION_VALUE_POSSIBILITY_ID = [
    ACTION_VALUE_POSSIBILITY_ID.action_potential,
    ACTION_VALUE_POSSIBILITY_ID.action_in_progress,
    ACTION_VALUE_POSSIBILITY_ID.action_paused,
    ACTION_VALUE_POSSIBILITY_ID.action_completed,
    ACTION_VALUE_POSSIBILITY_ID.action_failed,
    ACTION_VALUE_POSSIBILITY_ID.action_rejected,
]



export const VALUE_POSSIBILITY_IDS_to_text = {
    [VALUE_POSSIBILITY_IDS.uncertainty]: "Uncertainty",

    [VALUE_POSSIBILITY_IDS.boolean_true]: "True",
    [VALUE_POSSIBILITY_IDS.boolean_false]: "False",

    [VALUE_POSSIBILITY_IDS.action_potential]: "Potential",
    [VALUE_POSSIBILITY_IDS.action_in_progress]: "In Progress",
    [VALUE_POSSIBILITY_IDS.action_paused]: "Paused",
    [VALUE_POSSIBILITY_IDS.action_completed]: "Completed",
    [VALUE_POSSIBILITY_IDS.action_failed]: "Failed",
    [VALUE_POSSIBILITY_IDS.action_rejected]: "Rejected",
}



export function parse_VAP_value (VAP: VAP, VAPs_represent: VAPsType): ParsedValue
{
    // TODO: When boolean, should we return something that's neither true nor false if probability === 0.5?
    const parsed_value = VAPs_represent === VAPsType.boolean ? VAP.probability > 0.5
        : (VAPs_represent === VAPsType.number ? parse_string_as_number(VAP.value)
        : VAP.value)

    return parsed_value
}


export function is_string_valid_number (num_str: string): boolean
{
    return !Number.isNaN(parse_string_as_number(num_str))
}


// TODO: Maybe we should replace this functionality with the simulation.js library
// This would also allow handling of units and calculations and allow referencing
// other component values via @@<wcomponent_id> syntax
function parse_string_as_number (num_str: string): number | null
{
    num_str = num_str.trim()
    // Allow empty strings to be return null instead of NaN.  NaN is resereved for invalid numbers
    if (num_str === "") return null

    const matches = num_str.match(/^(-?[0-9]*\.?[0-9]*)\s*(?:(e)\s*(-?[0-9]+))?\s*(\%)?$/)
    let value = NaN
    do
    {
        if (!matches) break
        const [, num, exponent_sign, exponent, percentage] = matches
        if (!num) break
        value = parseFloat(num)
        if (Number.isNaN(value)) break
        if (exponent_sign && exponent) value = value * 10 ** parseInt(exponent)
        if (percentage) value = value / 100
    } while (false)

    return value
}



export function get_parsed_value_represented_by_a_VAP (VAP: VAP, VAPs_represent: VAPsType): ParsedValue
{
    let parsed_value = parse_VAP_value(VAP, VAPs_represent)
    if (VAPs_represent === VAPsType.boolean) {
        parsed_value = VAP.value_id === VALUE_POSSIBILITY_IDS.boolean_true
    }

    return parsed_value
}