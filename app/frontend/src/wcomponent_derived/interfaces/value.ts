
export type ParsedValue = string | number | boolean | null


export interface CurrentValueAndProbability
{
    original_value: string
    parsed_value: ParsedValue
    value_id?: string
    probability: number
    /**
     * `conviction` is referenced to as confidence in UI
     */
    conviction: number
    /**
     * `certainty` is  `probability * conviction`  aka  `probability * confidence`
     */
    certainty: number
}



// Contains values as string for display and derived booleans for determining
// what else / how it should be displayed
export interface DerivedValueForUI
{
    values_string: string
    counterfactual_applied: boolean | undefined
    uncertain: boolean | undefined
    derived__using_values_from_wcomponent_ids: string[] | undefined
}


// Contains is_valid calculation and derived boolean and degree of certainty
// for determining how it should be displayed
export interface DerivedValidityForUI
{
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
