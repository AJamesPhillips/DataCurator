import { YAMLParseError } from "yaml"
import { ReplaceNormalIdsInTextArgs } from "../sharedf/rich_text/interfaces"
import { NumberDisplayType } from "../shared/types"



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
    name: string
    value: string  // strings might be an @@<uuid v4>
    units?: string
    result_sig_figs?: number
    result_display_type?: NumberDisplayType
}

export interface CalculationResult
{
    value: number | undefined
    units: string
    error?: string
}
