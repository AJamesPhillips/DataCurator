import type { h } from "preact"

import type { CanvasPoint } from "../canvas/interfaces"


export type ChildrenRawData = h.JSX.Element[]

export interface ChildrenData
{
    element: h.JSX.Element | null
    content_coordinates: CanvasPoint[]
}


export interface IViewController
{
    // get_origin_ms: () => number
    // update_origin_ms: (origin_ms: number) => void
    // get_max_y: () => number
    update_display_status: (should_display: boolean) => void

    get_svg_children: () => h.JSX.Element | null
    get_children: () => ChildrenData
    get_svg_upper_children: () => h.JSX.Element | null
    // get_content_coordinates: () => CanvasPoint[]
}
