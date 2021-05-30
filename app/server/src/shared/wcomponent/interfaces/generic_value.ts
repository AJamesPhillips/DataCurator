


export type VAPsRepresent =
{
    boolean: true
    number?: false
    other?: false
} |
{
    boolean?: false
    number: true
    other?: false
} |
{
    boolean?: false
    number?: false
    other: true
}



export interface CurrentValuePossibility
{
    value: string | number | boolean
    probability: number
    conviction: number
    uncertain: boolean
    assumed: boolean
    // likey?: boolean
}


export interface CurrentValue
{
    possibilities: CurrentValuePossibility[]

    value: undefined | string | number | boolean
    probability: undefined | number
    conviction: undefined | number
    uncertain: undefined | boolean
    assumed: undefined | boolean
}



export interface UIValue
{
    values_string: string
    probabilities_string: string
    convictions_string: string
    assumed?: boolean
    uncertain?: boolean
}
