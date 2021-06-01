

// export interface CertaintyRange
// {
//     min: number
//     min_is_exclusive?: boolean
//     max: number
//     max_is_inclusive?: boolean
// }



// export enum Certainty
// {
//     yes = "yes", // 100%
//     likely = "likely",
//     maybe = "maybe",
//     unlikely = "unlikely",
//     no = "no", // 0%
// }

// // TODO merged this with the list in probabilities?
// export const order_of_certainties: Certainty[] = [
//     Certainty.yes,
//     Certainty.likely,
//     Certainty.maybe,
//     Certainty.unlikely,
//     Certainty.no,
// ]



// export function certainty_to_range (certainty: Certainty): CertaintyRange
// {

// }

// export const map_certainty_to_range: {[certainty in Certainty]: CertaintyRange} = {
//     yes:      { min: 1, max: 1, max_is_inclusive: true },
//     likely:   { min: 0.95, max: 1 },
//     maybe:    { min: 0.05, max: 0.95 },
//     unlikely: { min: 0, max: 0.05, min_is_exclusive: true },
//     no:       { min: 0, max: 0, max_is_inclusive: true },
// }
