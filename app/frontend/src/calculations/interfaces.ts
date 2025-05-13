import { YAMLParseError } from "yaml"
import { NumberDisplayType } from "../shared/types"
import { ReplaceNormalIdsInTextArgs } from "../sharedf/rich_text/interfaces"



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


export type PlainCalculationObjectV1 = ValidPlainCalculationObject | InvalidCalculationObject


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




/**
 * Version 2 of PlainCalculationObject
 */
export interface PlainCalculationObject
{
    // The value for this can be reused so does not guarantee it will remain
    // unique across time, but at any one time it should be unique.
    id: number
    name: string
    /**
     * Before being calculated, might be an @@<uuid v4> that will be deferenced
     * to give a value.
     */
    value: string
    units?: string
    result_sig_figs?: number
    result_display_type?: NumberDisplayType
    result_description?: string
}

export interface CalculationResult
{
    value: number | undefined
    units: string
    /**
     * Strings must be a @@<uuid v4>.  This is the component which the value was
     * dereferenced from.  Currently only one value is allowed.
     */
    source_wcomponent_id?: string
    error?: string
    warning?: string
}
