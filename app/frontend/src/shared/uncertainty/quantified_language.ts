

export interface CertaintyRange
{
    min_inc: number
    max: number
    max_is_exclusive?: boolean
}



export enum Certainty
{
    yes = "yes", // 100%
    likely = "likely",
    maybe = "maybe",
    unlikely = "unlikely",
    no = "no", // 0%
}

export const order_of_certainties: Certainty[] = [
    Certainty.yes,
    Certainty.likely,
    Certainty.maybe,
    Certainty.unlikely,
    Certainty.no,
]



// export function certainty_to_range (certainty: Certainty): CertaintyRange
// {

// }

// export const map_certainty_to_range: {[certainty in Certainty]: CertaintyRange} = {
//     yes:      { min_inc: 1, max: 1, max_is_exclusive: true },
//     likely:   { min_inc: 0.95, max: 1, max_is_exclusive: false },
//     maybe:    { min_inc: 1, max: 1, max_is_exclusive: false },
//     unlikely: { min_inc: 1, max: 1, max_is_exclusive: false },
//     no:       { min_inc: 0, max: 0, max_is_exclusive: false },
// }
