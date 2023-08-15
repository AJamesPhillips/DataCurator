import { YAMLParseError } from "yaml"
import { WComponentNodeStateV2 } from "../../../wcomponent/interfaces/state"



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




interface ValidCalculationObject
{
    valid: true
    value: number | WComponentNodeStateV2
    name?: string
}

interface InvalidCalculationObject
{
    valid: false
    errors: (string | YAMLParseError)[]
}


export type CalculationObject = ValidCalculationObject | InvalidCalculationObject
