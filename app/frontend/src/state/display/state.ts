

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



export type TimeResolution = "minute" | "hour" | "day"

export interface DisplayState
{
    last_toggle_rich_text_formatting_time_stamp: number | undefined
    rich_text_formatting: boolean
    canvas_bounding_rect: BoundingRect | undefined
    time_resolution: TimeResolution
}
