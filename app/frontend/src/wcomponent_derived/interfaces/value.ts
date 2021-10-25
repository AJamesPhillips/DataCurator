
export type ParsedValue = string | number | boolean | null


export interface CurrentValueAndProbability
{
    parsed_value: ParsedValue
    value_id?: string
    probability: number
    conviction: number
    certainty: number
}



// Contains values as string for display and derived booleans for determining
// what else / how it should be displayed
export interface DerivedValueForUI
{
    is_defined: boolean
    values_string: string
    counterfactual_applied?: boolean
    uncertain?: boolean
}


// Contains is_valid calculation and derived boolean and degree of certainty
// for determining how it should be displayed
export interface DerivedValidityForUI
{
    is_defined: boolean
    is_valid: boolean
    certainty: number
}



export interface VAPVisual
{
    VAP_id: string
    value_id?: string
    parsed_value: ParsedValue
    value_text: string
    certainty: number
}
