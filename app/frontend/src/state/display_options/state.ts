import type { TimeResolution } from "../../shared/utils/datetime"
// import type { Certainty } from "../../shared/uncertainty/quantified_language"



export interface BoundingRect
{
    width: number
    height: number
    left: number
    top: number
}


export function bounding_rects_equal (br1: BoundingRect | undefined, br2: BoundingRect | undefined): boolean
{
    if (br1 === undefined || br2 === undefined) return false

    return (br1.top === br2.top && br1.height === br2.height && br1.left === br2.left && br1.width === br2.width)
}



// export type ValidityToCertainty = {[k in Certainty] : ValidityDisplayOptions }
// interface ValidityDisplayOptions
// {
//     display: boolean
//     opacity: number
// }

export type ValidityToCertaintyTypes = "hide_invalid" | "show_invalid"
// export type ValidityToCertainty_TypeToMap = {[k in ValidityToCertaintyTypes] : ValidityToCertainty }


export interface DisplayOptionsState
{
    consumption_formatting: boolean
    time_resolution: TimeResolution

    // Validity
    validity_to_certainty: ValidityToCertaintyTypes

    // not an option.  Move to a different state.
    canvas_bounding_rect: BoundingRect | undefined
}


const _time_resolution_types: {[P in TimeResolution]: true} = {
    minute: true,
    hour: true,
    day: true,
}
export const time_resolution_types: TimeResolution[] = Object.keys(_time_resolution_types) as any
