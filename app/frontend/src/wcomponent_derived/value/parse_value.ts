import type { StateValueAndPrediction } from "../../wcomponent/interfaces/state"
import { VAPsType } from "../../wcomponent/interfaces/VAPsType"
import type { ParsedValue } from "../interfaces/value"



export function parse_VAP_value (VAP: StateValueAndPrediction, VAPs_represent: VAPsType): ParsedValue
{
    // TODO: When boolean, should we return something that's neither true nor false if probability === 0.5?
    const value = VAPs_represent === VAPsType.boolean ? VAP.probability > 0.5
        : (VAPs_represent === VAPsType.number ? parseFloat(VAP.value)
        : VAP.value)

    return value
}
