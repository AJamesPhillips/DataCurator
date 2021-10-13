import type { StateValueAndPrediction as VAP } from "../interfaces/state"
import { VAPsType } from "../interfaces/VAPsType"
import type { ParsedValue } from "../../wcomponent_derived/interfaces/value"
import type { SimpleValuePossibility } from "../interfaces/possibility"



// Do NOT change these otherwise you will break people's existing data
export const value_possibility_visual_uncertainty_id = "value_possibility_uncertainty_id__undefined__"
export const value_possibility_visual_true_id = "value_possibility_true_id"
export const value_possibility_visual_false_id = "value_possibility_false_id"


export function parse_VAP_value (VAP: VAP, VAPs_represent: VAPsType): ParsedValue
{
    // TODO: When boolean, should we return something that's neither true nor false if probability === 0.5?
    const parsed_value = VAPs_represent === VAPsType.boolean ? VAP.probability > 0.5
        : (VAPs_represent === VAPsType.number ? parseFloat(VAP.value)
        : VAP.value)

    return parsed_value
}



export function value_possibility_for_UI (value_possibility: SimpleValuePossibility, VAPs_represent: VAPsType): ParsedValue
{
    let parsed_value = VAPs_represent === VAPsType.boolean ? value_possibility.id === value_possibility_visual_true_id
        : (VAPs_represent === VAPsType.number ? parseFloat(value_possibility.value)
        : value_possibility.value)

    return parsed_value
}



export function get_VAPs_representing_parsed_value (VAP: VAP, VAPs_represent: VAPsType): ParsedValue
{
    let parsed_value = parse_VAP_value(VAP, VAPs_represent)
    if (VAPs_represent === VAPsType.boolean) {
        parsed_value = VAP.value_id === value_possibility_visual_true_id
    }

    return parsed_value
}