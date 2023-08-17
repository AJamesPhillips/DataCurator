import { YAMLParseError } from "yaml"
import { WComponentNodeStateV2 } from "../../../wcomponent/interfaces/state"
import { ReplaceNormalIdsInTextArgs } from "../interfaces"



interface ValidPlainCalculationObject
{
    valid: true
    value: number | string  // strings might be an @@<uuid v4>
    name?: string
}

interface InvalidPlainCalculationObject
{
    valid: false
    errors: (string | YAMLParseError)[]
}


export type PlainCalculationObject = ValidPlainCalculationObject | InvalidPlainCalculationObject




interface CompleteCalculationObject
{
    valid: true
    name: string
    value_str: string
    value: number
}

interface InvalidCalculationObject
{
    valid: false
    errors: (string | YAMLParseError)[]
}


export type FullCalculationObject = CompleteCalculationObject | InvalidCalculationObject



export interface ReplaceCalculationsWithResults extends ReplaceNormalIdsInTextArgs
{
    created_at_ms: number
    sim_ms: number
}
