

export interface CurrentValuePossibility
{
    value: string | number | boolean
    probability: number
    conviction: number
    uncertain: boolean
    // uncertain?: boolean
    // assumed?: boolean
    // likey?: boolean
}


export interface CurrentValue
{
    value: undefined | string | number | boolean
    probability: undefined | number
    conviction: undefined | number
    uncertain: undefined | boolean
    possibilities: CurrentValuePossibility[]
    // assumed?: boolean
}



// TODO upgrade UIStateValue to use these interfaces instead
export interface UIValue
{
    value: string | undefined
    probability: number | undefined
    conviction: number | undefined
    assumed?: boolean
    uncertain?: boolean
}
