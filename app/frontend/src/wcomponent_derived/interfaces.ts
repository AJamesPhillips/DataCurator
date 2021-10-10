


// Contains strings for display and derived booleans for determining what else should be displayed
export interface DerivedValueForUI
{
    is_defined: boolean
    values_string: string
    probabilities_string: string
    convictions_string: string
    assumed?: boolean
    uncertain?: boolean
}
