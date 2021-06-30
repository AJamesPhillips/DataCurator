


export enum VAPsType {
    boolean,
    number,
    other,
    action,
    undefined,
}


export type ParsedValue = string | number | boolean | null


export interface CurrentValueAndProbabilities
{
    value: ParsedValue
    probability: number
    conviction: number
    certainty: number
    uncertain: boolean
    assumed: boolean
    // likey?: boolean
}


export interface CurrentValue
{
    probabilities: CurrentValueAndProbabilities[]

    is_defined: boolean
    value: undefined | ParsedValue
    probability: number
    conviction: number
    certainty: number
    uncertain: boolean
    assumed: boolean
}



export interface UIValue
{
    is_defined: boolean
    values_string: string
    probabilities_string: string
    convictions_string: string
    assumed?: boolean
    uncertain?: boolean
}
