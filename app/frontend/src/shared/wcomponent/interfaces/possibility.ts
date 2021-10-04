


export interface ValuePossibility
{
    id: string
    order: number
    value: string

    // What the value refers to, e.g. if it's not obvious what "value"
    // means then use this to disambiguate it.
    description: string

    // How the value is present, e.g. "completed" value could be displayed as "delivered"
    // presentation: string
}



// Used when we want to work with value possibilities as simple strings without having a
// collection of `ValuePossibility`, i.e. the `value_possibilities` attribute is undefined
export type SimpleValuePossibility = Partial<ValuePossibility> &
{
    value: string
}



export type ValuePossibilitiesById = {[id: string]: ValuePossibility }
