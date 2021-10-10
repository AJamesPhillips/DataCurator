


export enum VAPsType {
    boolean,
    number,
    other,
    action,
    undefined,
}


export type ParsedValue = string | number | boolean | null


export interface CurrentValueAndProbability
{
    value: ParsedValue
    probability: number
    conviction: number
    certainty: number
    uncertain: boolean
    assumed: boolean
    // likey?: boolean
}


export interface CurrentValueAndProbabilities
{
    probabilities: CurrentValueAndProbability[]

    is_defined: boolean
    value: undefined | ParsedValue
    probability: number
    conviction: number
    certainty: number
    uncertain: boolean
    assumed: boolean
}



export interface CurrentValidityValueAndProbabilities extends CurrentValueAndProbabilities
{
    value: boolean
}
