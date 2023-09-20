import { YAMLParseError } from "yaml"
import { WComponentNodeStateV2 } from "../../wcomponent/interfaces/state"
import { ReplaceNormalIdsInTextArgs } from "../../sharedf/rich_text/interfaces"



interface ValidPlainCalculationObject
{
    valid: true
    value: number | string  // strings might be an @@<uuid v4>
    name?: string
}

interface InvalidCalculationObject
{
    valid: false
    errors: (string | YAMLParseError)[]
}


export type PlainCalculationObject = ValidPlainCalculationObject | InvalidCalculationObject




interface _FullCalculationObject
{
    valid: true
    name: string
    value_str: string
    value: number
}


export type FullCalculationObject = _FullCalculationObject | InvalidCalculationObject



interface _ParsedCalculationObject
{
    valid: true
    name: string
    value_str: string
    value: number
    needs_computing: boolean
}


export type ParsedCalculationObject = _ParsedCalculationObject | InvalidCalculationObject




export interface ReplaceCalculationsWithResults extends ReplaceNormalIdsInTextArgs
{
    created_at_ms: number
    sim_ms: number
}
